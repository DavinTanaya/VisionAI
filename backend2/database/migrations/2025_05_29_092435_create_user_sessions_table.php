<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('focus')->default(25);
            $table->integer('break')->default(5);
            $table->integer('repeat')->default(4);
            $table->integer('yawning')->default(0);
            $table->integer('closed')->default(0);
            $table->integer('done')->default(0);
            $table->integer('runtime')->default(0);
            $table->timestamp('last_incremented_at')->nullable();
            $table->foreignId('userId')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
