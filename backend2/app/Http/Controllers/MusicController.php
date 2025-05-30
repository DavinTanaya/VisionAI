<?php

namespace App\Http\Controllers;

use App\Http\Requests\MusicRequest;
use App\Http\Responses\DataResponse;
use App\Http\Responses\ResponseCode;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Response;

class MusicController extends Controller
{
    public function getMusic()
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $music = Music::where('userId', '=', $user->id)->get(['id', 'title', 'url']);
        return new DataResponse([
            $music
        ], ResponseCode::SUCCESS_CODE, '', 'Success.');
    }

    public function addMusic(MusicRequest $request)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $music = Music::create([
            'title' => $request->title,
            'url' => $request->url,
            'userId' => $user->id
        ]);

        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Music Successfully Added'
        );
    }

    public function updateMusic(MusicRequest $request, $id)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }
        $music = Music::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        if(!$music) {
            return new DataResponse(
            [], ResponseCode::NOT_FOUND_CODE, '', 'Music Not Found'
            );
        }
        if($request->title){
            $music->title = $request->title;
        }
        if($request->url){
            $music->url = $request->url;
        }
        $music->save();
        return new DataResponse(
            [], ResponseCode::SUCCESS_CODE, '', 'Music Successfully Updated'
        );
    }

    public function deleteMusic($id)
    {
        $user = Auth::user();
        if(!$user){
            return new DataResponse(
                [], ResponseCode::FORBIDDEN_CODE 
            );
        }   
        $music = Music::where('id', '=', $id)->where('userId', '=', $user->id)->first();
        if($music){
            Music::destroy($id);
            return new DataResponse(
                [], ResponseCode::SUCCESS_CODE, '', 'Music Successfully Deleted'
            );
        }
        else{
            return new DataResponse(
                [], ResponseCode::NOT_FOUND_CODE, '', 'Music Not Found'
            );
        }
    }
}
