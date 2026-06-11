<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->date('date');
            $table->json('times');                         // ["16:00","17:00"]
            $table->unsignedInteger('total')->nullable();
            $table->string('telegram', 64);
            $table->text('comment')->nullable();
            $table->string('status', 16)->default('pending'); // pending|confirmed|declined
            $table->timestamps();

            $table->index(['date', 'status']);
            $table->index(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
