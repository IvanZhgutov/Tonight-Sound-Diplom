<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->string('name', 100);
            $table->unsignedInteger('price')->nullable(); // null = «по запросу»
            $table->boolean('hourly')->default(false);    // цена за час или за трек
            $table->boolean('bookable')->default(false);  // доступна в онлайн-записи
            $table->string('icon', 8)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
