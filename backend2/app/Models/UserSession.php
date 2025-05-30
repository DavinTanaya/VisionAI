<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    protected $fillable = [
        'name',
        'focus',
        'break',
        'repeat',
        'yawning',
        'closed',
        'done',
        'runtime',
        'userId',
        'last_incremented_at'
    ];
}
