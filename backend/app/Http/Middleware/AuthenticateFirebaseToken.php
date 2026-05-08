<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthenticateFirebaseToken
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->bearerToken($request);

        if (! $token) {
            return $this->unauthorized('Missing Firebase ID token.');
        }

        $projectId = config('services.firebase.project_id');

        if (! $projectId) {
            return response()->json(['message' => 'Firebase project ID is not configured.'], 500);
        }

        try {
            $payload = $this->verifyToken($token, $projectId);
        } catch (Throwable $exception) {
            return $this->unauthorized($exception->getMessage());
        }

        $request->attributes->set('firebase_token', $payload);
        $request->attributes->set('firebase_uid', $payload['sub']);
        $request->attributes->set('firebase_email', $payload['email'] ?? null);

        return $next($request);
    }

    private function bearerToken(Request $request): ?string
    {
        $authorization = $request->header('Authorization');

        if (! is_string($authorization) || ! str_starts_with($authorization, 'Bearer ')) {
            return null;
        }

        return trim(substr($authorization, 7));
    }

    private function verifyToken(string $token, string $projectId): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new \RuntimeException('Invalid Firebase ID token format.');
        }

        [$headerPart, $payloadPart, $signaturePart] = $parts;

        $header = $this->jsonDecode($this->base64UrlDecode($headerPart));
        $payload = $this->jsonDecode($this->base64UrlDecode($payloadPart));

        if (($header['alg'] ?? null) !== 'RS256') {
            throw new \RuntimeException('Invalid Firebase token algorithm.');
        }

        $kid = $header['kid'] ?? null;
        $certs = $this->firebaseCerts();
        $cert = $kid ? ($certs[$kid] ?? null) : null;

        if (! $cert) {
            throw new \RuntimeException('Firebase signing certificate was not found.');
        }

        $signedPayload = $headerPart.'.'.$payloadPart;
        $signature = $this->base64UrlDecode($signaturePart);
        $validSignature = openssl_verify($signedPayload, $signature, $cert, OPENSSL_ALGO_SHA256);

        if ($validSignature !== 1) {
            throw new \RuntimeException('Invalid Firebase token signature.');
        }

        $now = time();
        $issuer = 'https://securetoken.google.com/'.$projectId;

        if (($payload['aud'] ?? null) !== $projectId) {
            throw new \RuntimeException('Firebase token audience does not match this project.');
        }

        if (($payload['iss'] ?? null) !== $issuer) {
            throw new \RuntimeException('Firebase token issuer is invalid.');
        }

        if (empty($payload['sub']) || ! is_string($payload['sub'])) {
            throw new \RuntimeException('Firebase token subject is missing.');
        }

        if (($payload['exp'] ?? 0) < $now) {
            throw new \RuntimeException('Firebase token has expired.');
        }

        if (($payload['iat'] ?? 0) > $now + 300) {
            throw new \RuntimeException('Firebase token was issued in the future.');
        }

        return $payload;
    }

    private function firebaseCerts(): array
    {
        return Cache::remember('firebase_securetoken_certs', now()->addHours(6), function () {
            $response = Http::timeout(5)->get(self::CERTS_URL);

            if (! $response->successful()) {
                throw new \RuntimeException('Could not load Firebase signing certificates.');
            }

            return $response->json();
        });
    }

    private function base64UrlDecode(string $value): string
    {
        $value = strtr($value, '-_', '+/');
        $padding = strlen($value) % 4;

        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode($value, true);

        if ($decoded === false) {
            throw new \RuntimeException('Invalid base64url value.');
        }

        return $decoded;
    }

    private function jsonDecode(string $value): array
    {
        $decoded = json_decode($value, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($decoded)) {
            throw new \RuntimeException('Invalid Firebase token JSON.');
        }

        return $decoded;
    }

    private function unauthorized(string $message): Response
    {
        return response()->json(['message' => $message], 401);
    }
}
