<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFirebaseRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $firebaseUid = $request->attributes->get('firebase_uid');

        if (! $firebaseUid) {
            return response()->json(['message' => 'Missing authenticated Firebase user.'], 401);
        }

        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'You are not allowed to access this API route.'], 403);
        }

        $request->attributes->set('api_user', $user);

        return $next($request);
    }
}
