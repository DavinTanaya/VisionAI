<?php

namespace App\Http\Responses;

class ResponseCode
{
   const SUCCESS_CODE = 200;
   const CREATED_CODE = 201;
   const NO_CONTENT_CODE = 204;
   const BAD_REQUEST_CODE = 400;
   const UNAUTHORIZED_CODE = 401;
   const FORBIDDEN_CODE = 403;
   const NOT_FOUND_CODE = 404;
   const UNPROCESSABLE_ENTITY = 422;
   const SERVER_ERROR_CODE = 500;
}