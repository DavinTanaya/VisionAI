<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Responses\DataResponse;
use App\Http\Responses\ResponseCode;
use App\Models\User;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $encryptionKey = Key::loadFromAsciiSafeString(config('app.encryption_key'));
        try {
            $token = Crypto::encrypt($token, $encryptionKey);
        } catch (\Exception $e) {
            return new DataResponse('', ResponseCode::SERVER_ERROR_CODE, 'Encryption failed.', $e->getMessage());
        }

        return new DataResponse(
            ['token' => $token], ResponseCode::CREATED_CODE, '', ''
        );
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $encryptionKey = Key::loadFromAsciiSafeString(config('app.encryption_key'));
        try {
            $token = Crypto::encrypt($token, $encryptionKey);
        } catch (\Exception $e) {
            return new DataResponse('', ResponseCode::SERVER_ERROR_CODE, 'Encryption failed.', $e->getMessage());
        }

        return new DataResponse(
            ['token' => $token], ResponseCode::SUCCESS_CODE, '', ''
        );
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function getUser()
    {
        try {
            $user = Auth::user();
            $user = $user ? $user->only(['name', 'email']) : null;
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        try {
            $user = Auth::user();
            $user->update($request->only(['name', 'email']));
            return new DataResponse($user, ResponseCode::SUCCESS_CODE, '', 'Success');
        } catch (\Exception $e) {
            return new DataResponse([], ResponseCode::SERVER_ERROR_CODE, 'Failed to update user', '');
        }
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrNew(['email' => $googleUser->getEmail()]);

            if (!$user->exists) {
                $user->name      = $googleUser->getName();
                $user->google_id = $googleUser->getId();
                $user->save();
            } elseif (!$user->google_id) {
                $user->google_id = $googleUser->getId();
                $user->save();
            }

            $token = JWTAuth::fromUser($user);

            $encryptionKey = Key::loadFromAsciiSafeString(config('app.encryption_key'));
            $token = Crypto::encrypt($token, $encryptionKey);

            $frontendUrl = 'http://localhost:5173';

            return redirect()->away(
                $frontendUrl . '/auth/google/success?token=' . $token
            );
        } catch (\Exception $e) {
            $frontendUrl = 'http://localhost:5173';
            return redirect()->away(
                $frontendUrl . '/auth/google/error?message=' . urlencode('Authentication failed')
            );
        }
    }
}
