<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('paid_at')->nullable()->after('status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('is_admin'); // ["рэп","постоянный"]
        });

        Schema::create('client_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();   // клиент
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete(); // админ
            $table->text('text');
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', fn (Blueprint $table) => $table->dropColumn('paid_at'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('tags'));
        Schema::dropIfExists('client_notes');
    }
};
