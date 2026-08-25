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
        Schema::create('budget_accountability_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_accountability_id')
                ->constrained('budget_accountabilities', 'id', 'fk_ba_documents_header')
                ->cascadeOnDelete();

            $table->string('document_name', 255);
            $table->string('file_name', 255);
            $table->string('file_path', 255);
            $table->unsignedBigInteger('file_size');
            $table->string('file_type', 100);

            $table->foreignId('uploaded_by')
                ->constrained('users', 'id', 'fk_ba_documents_user')
                ->restrictOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_accountability_documents');
    }
};
