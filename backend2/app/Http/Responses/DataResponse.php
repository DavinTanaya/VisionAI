<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use App\Http\Responses\ResponseCode;
use App\Http\Responses\ResponseMessage;

class DataResponse implements Responsable
{
    protected $data;
    protected $error;
    protected $status;
    protected $message;

    public function __construct($data = '', $status = ResponseCode::SUCCESS_CODE, $error = '', $message = ResponseMessage::SUCCESS_MESSAGE)
    {
        $this->data = $data;
        $this->error = $error;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Convert the object to a JSON response.
     *
     * @param $request
     * @return JsonResponse
     */
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'status' => $this->status,
            'message' => $this->message,
            'error' => $this->error,
            'data' => $this->data,
        ], $this->status);
    }
}