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
        Schema::create('budget_request_activity_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('budget_request_activity_id');
            $table->string('document_name', 255);
            $table->string('file_name', 255);
            $table->string('file_path', 255);
            $table->unsignedBigInteger('file_size');
            $table->string('file_type', 100);
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();

            // Foreign keys
            $table->foreign('budget_request_activity_id', 'fk_request_activity_document_activity')
                ->references('id')
                ->on('budget_request_activities')
                ->onDelete('cascade');

            $table->foreign('uploaded_by', 'fk_request_activity_document_user')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            // Indexes
            $table->index('budget_request_activity_id', 'idx_request_activity_document_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_request_activity_documents');
    }
};