<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plugins', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->unique();
            $table->string('vendor', 120)->nullable();
            $table->string('version', 32)->nullable();
            $table->string('category', 40);
            $table->string('status', 16)->default('available'); // available|requested|new
            $table->timestamps();

            $table->index(['category', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plugins');
    }
};
