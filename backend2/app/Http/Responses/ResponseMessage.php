<?php

namespace App\Http\Responses;

class ResponseMessage
{
    const SUCCESS_MESSAGE = 'Request successful.';
    const CREATED_MESSAGE = 'Resource created successfully.';
    const NO_CONTENT_MESSAGE = 'No content.';
    const BAD_REQUEST_MESSAGE = 'Bad request.';
    const UNAUTHORIZED_MESSAGE = 'Unauthorized.';
    const FORBIDDEN_MESSAGE = 'Forbidden.';
    const NOT_FOUND_MESSAGE = 'Resource not found.';
    const UNPROCESSABLE_ENTITY_MESSAGE = 'The given data was invalid.';
    const SERVER_ERROR_MESSAGE = 'Internal server error.';
}