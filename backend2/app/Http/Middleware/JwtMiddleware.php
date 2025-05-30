<?php

namespace App\Http\Middleware;

use Closure;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;
use Illuminate\Http\Request;
use Exception;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $authorizationHeader = $request->header('Authorization');

            if (!$authorizationHeader || !str_starts_with($authorizationHeader, 'Bearer ')) {
                return response()->json(['error' => 'Token not provided or invalid format'], 400);
            }

            $token = substr($authorizationHeader, 7); // Remove "Bearer " prefix

            $encryptionKey = Key::loadFromAsciiSafeString(config('app.encryption_key'));
            $decryptedToken = Crypto::decrypt($token, $encryptionKey);

            JWTAuth::setToken($decryptedToken)->authenticate();
        } catch (Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
