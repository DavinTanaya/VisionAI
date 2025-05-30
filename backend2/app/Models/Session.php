<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $fillable = [
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