<?php

namespace App\Http\Controllers;

use App\Http\Requests\SessionRequest;
use App\Http\Responses\DataResponse;
use App\Http\Responses\ResponseCode;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSessionController extends Controller
{
    public function getSession()
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('userId', '=', $user->id)->get(['id','name', 'focus', 'break', 'repeat', 'yawning', 'closed', 'done', 'runtime',]);
        return new DataResponse([
            $session
        ], ResponseCode::SUCCESS_CODE, '', 'Success.');
    }

    public function getSessionById($id)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        if(!$session) {
            return new DataResponse(
                [], ResponseCode::NOT_FOUND_CODE, '', 'Session Not Found'
            );
        }
        return new DataResponse([
            $session
        ], ResponseCode::SUCCESS_CODE, '', 'Success.');
    }

    public function addSession(SessionRequest $request)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::create([
            'name' => $request->name,
            'focus' => $request->focus,
            'break' => $request->break,
            'repeat' => $request->repeat,
            'userId' => $user->id
        ]);
        $data = $session->only(['id','name', 'focus', 'break', 'repeat', 'yawning', 'closed', 'done', 'runtime']);
        return new DataResponse(
            $data, ResponseCode::SUCCESS_CODE, '', 'Session Successfully Added'
        );
    }

    public function updateSession(SessionRequest $request, $id)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        if(!$session) {
            return new DataResponse(
                [], ResponseCode::NOT_FOUND_CODE, '', 'Session Not Found'
            );
        }
        $session->focus = $request->focus;
        $session->break = $request->break;
        $session->repeat = $request->repeat;
        $session->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Session Successfully Updated'
        );
    }

    public function incrementRuntime($id){
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        if (!$session->last_incremented_at) {
            $session->runtime += 10;
            $session->last_incremented_at = now();
        } else {
            $diffInSeconds = now()->diffInSeconds($session->last_incremented_at);
            if (abs($diffInSeconds) >= 10) {
                $session->runtime += 10;
                $session->last_incremented_at = now();
            } else {
                return new DataResponse(
                    $diffInSeconds, ResponseCode::FORBIDDEN_CODE, '', 'Increment not allowed yet'
                );
            }
        }
        $session->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Session Successfully Updated'
        );
    }
    public function incrementYawning($id){
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        $session->yawning += 1;
        $session->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Session Successfully Updated'
        );
    }
    public function incrementClosed($id){
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        $session->closed += 1;
        $session->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Session Successfully Updated'
        );
    }
    public function incrementDone($id){
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $session = UserSession::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        $session->done += 1;
        $session->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Session Successfully Updated'
        );
    }
}
