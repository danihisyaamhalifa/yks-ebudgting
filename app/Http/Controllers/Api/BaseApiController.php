<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class BaseApiController extends Controller
{
    protected $model;
    protected $searchableColumns = [];
    protected $filterableColumns = [];
    protected $sortableColumns = [];
    protected $defaultSort = ['id' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;
    protected $queryStartTime;

    public function __construct(Model $model = null)
    {
        if ($model) {
            $this->model = $model;
            $this->initializeColumns();
        }
        $this->queryStartTime = microtime(true);
    }

    /**
     * Initialize searchable, filterable, and sortable columns from model
     */
    protected function initializeColumns(): void
    {
        if (empty($this->searchableColumns)) {
            $this->searchableColumns = $this->model->getFillable();
        }

        if (empty($this->filterableColumns)) {
            $this->filterableColumns = $this->model->getFillable();
        }

        if (empty($this->sortableColumns)) {
            $this->sortableColumns = array_merge($this->model->getFillable(), ['id', 'created_at', 'updated_at']);
        }
    }

    /**
     * Return a standardized success response
     */
    protected function successResponse($data = null, string $message = null, int $statusCode = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a standardized error response
     */
    protected function errorResponse(string $message, int $statusCode = 400, $errors = null, array $meta = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'data' => null,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a standardized validation error response
     */
    protected function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        return $this->errorResponse(
            'Validation failed',
            422,
            $exception->errors()
        );
    }

    /**
     * Handle exceptions and return standardized error response
     */
    protected function handleException(Exception $exception): JsonResponse
    {
        if ($exception instanceof ValidationException) {
            return $this->validationErrorResponse($exception);
        }

        // Log the exception for debugging
        logger()->error('API Exception: ' . $exception->getMessage(), [
            'exception' => $exception,
            'trace' => $exception->getTraceAsString()
        ]);

        $statusCode = $exception instanceof HttpException ? $exception->getStatusCode() : 500;
        $message = app()->environment('production') ? 'An error occurred' : $exception->getMessage();

        return $this->errorResponse($message, $statusCode);
    }


    /**
     * Apply search functionality
     */
    protected function applySearch(Builder $query, Request $request): void
    {
        $search = $request->input('search');

        if (!empty($search) && !empty($this->searchableColumns)) {
            $query->where(function ($q) use ($search) {
                foreach ($this->searchableColumns as $column) {
                    // $q->orWhere($column, 'ILIKE', "%{$search}%"); //postgres sql
                    $q->orWhere($column, 'LIKE', "%{$search}%");
                }
            });
        }
    }

    /**
     * Apply column-specific filters
     */
    protected function applyFilters(Builder $query, Request $request): void
    {
        $filters = $request->input('filter', []);

        if (is_array($filters)) {
            foreach ($filters as $column => $value) {
                if (in_array($column, $this->filterableColumns) && !empty($value)) {
                    if (is_array($value)) {
                        // Handle array filters (e.g., multiple select)
                        $query->whereIn($column, $value);
                    } else {
                        // Handle single value filters
                        $query->where($column, $value);
                    }
                }
            }
        }
    }

    /**
     * Apply sorting
     */
    protected function applySorting(Builder $query, Request $request): void
    {
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'asc');

        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';

        if ($sortBy && in_array($sortBy, $this->sortableColumns)) {
            // Support sorting by related model columns using dot notation, e.g. "category.name"
            if (strpos($sortBy, '.') !== false) {
                [$relationName, $relatedColumn] = explode('.', $sortBy, 2);

                // Ensure the relation method exists on the model
                $model = $this->model;
                if (method_exists($model, $relationName)) {
                    try {
                        $relation = $model->$relationName();

                        if ($relation instanceof Relation) {
                            $relatedTable = $relation->getRelated()->getTable();
                            $primaryTable = $model->getTable();

                            // Build join depending on relation type
                            if ($relation instanceof BelongsTo) {
                                // child table (primary) has foreign key
                                $foreignKey = $relation->getForeignKeyName();
                                $ownerKey = $relation->getOwnerKeyName();
                                $query->leftJoin($relatedTable, "$primaryTable.$foreignKey", '=', "$relatedTable.$ownerKey");
                            } elseif ($relation instanceof HasOne || $relation instanceof HasMany) {
                                // related table has foreign key
                                $foreignKey = $relation->getForeignKeyName();
                                $localKey = $relation->getLocalKeyName();
                                $query->leftJoin($relatedTable, "$relatedTable.$foreignKey", '=', "$primaryTable.$localKey");
                            } else {
                                // Fallback: attempt a generic join assuming related table PK is 'id'
                                $query->leftJoin($relatedTable, "$primaryTable.{$relationName}_id", '=', "$relatedTable.id");
                            }

                            // Order by the related table column
                            $query->orderBy("$relatedTable.$relatedColumn", $sortOrder);
                            return;
                        }
                    } catch (\Throwable $e) {
                        // If any issue occurs, fall back to default ordering below
                        logger()->debug('applySorting relation join failed: ' . $e->getMessage());
                    }
                }
            }

            // Default: order by column on primary table
            $query->orderBy($sortBy, $sortOrder);
        } else {
            // Apply default sorting
            foreach ($this->defaultSort as $column => $direction) {
                $query->orderBy($column, $direction);
            }
        }
    }

    /**
     * Get per page value with validation
     */
    protected function getPerPage(Request $request): int
    {
        $perPage = (int) $request->input('per_page', $this->defaultPerPage);

        if ($perPage === -1) {
            return -1;
        }

        return min(max(1, $perPage), $this->maxPerPage);
    }

    /**
     * Format response for data table consumption
     */
    protected function formatDataTableResponse(LengthAwarePaginator|Collection $data, Request $request, array $extraData = []): JsonResponse
    {
        $isPaginated = $data instanceof LengthAwarePaginator;
        $total = $isPaginated ? $data->total() : $data->count();
        $queryTime = $total > 0 ? round((microtime(true) - $this->queryStartTime) * 1000, 2) : 0; // in milliseconds

        if ($isPaginated) {
            $meta = [
                'pagination' => [
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                    'from' => $data->firstItem(),
                    'to' => $data->lastItem(),
                    'has_more_pages' => $data->hasMorePages(),
                    'path' => $data->path(),
                ],
                'links' => [
                    'first' => $data->url(1),
                    'last' => $data->url($data->lastPage()),
                    'prev' => $data->previousPageUrl(),
                    'next' => $data->nextPageUrl(),
                ],
                'request_info' => [
                    'search' => $request->input('search'),
                    'filters' => $request->input('filters', []),
                    'sort_by' => $request->input('sort_by'),
                    'sort_order' => $request->input('sort_order', 'asc'),
                    'per_page' => $this->getPerPage($request),
                    'page' => $request->input('page', 1),
                ],
                'config' => [
                    'searchable_columns' => $this->searchableColumns,
                    'filterable_columns' => $this->filterableColumns,
                    'sortable_columns' => $this->sortableColumns,
                    'max_per_page' => $this->maxPerPage,
                ],
                'query_time_ms' => $queryTime
            ];

            return $this->successResponse($data->items(), 'Data retrieved successfully', 200, array_merge($meta, $extraData));
        } else {
            // For Collection (non-paginated data)
            $meta = [
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $total,
                    'total' => $total,
                    'from' => $total > 0 ? 1 : null,
                    'to' => $total,
                    'has_more_pages' => false,
                    'path' => $request->url(),
                ],
                'links' => [
                    'first' => $request->url(),
                    'last' => $request->url(),
                    'prev' => null,
                    'next' => null,
                ],
                'request_info' => [
                    'search' => $request->input('search'),
                    'filters' => $request->input('filters', []),
                    'sort_by' => $request->input('sort_by'),
                    'sort_order' => $request->input('sort_order', 'asc'),
                    'per_page' => $total,
                    'page' => 1,
                ],
                'config' => [
                    'searchable_columns' => $this->searchableColumns,
                    'filterable_columns' => $this->filterableColumns,
                    'sortable_columns' => $this->sortableColumns,
                    'max_per_page' => $this->maxPerPage,
                ],
                'query_time_ms' => $queryTime
            ];

            $finalResponse = array_merge($data->toArray(), $extraData);

            return $this->successResponse($finalResponse, 'Data retrieved successfully', 200, array_merge($meta, $extraData));
        }
    }


    /**
     * Get single resource
     */
    public function show($id): JsonResponse
    {
        try {
            $resource = $this->model->findOrFail($id);
            return $this->successResponse($resource, 'Resource retrieved successfully');
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Store new resource
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);
            $resource = $this->model->create($validated);
            return $this->successResponse($resource, 'Resource created successfully', 201);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }



    /**
     * Update existing resource
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $resource = $this->model->findOrFail($id);
            $validated = $this->validateRequest($request, $resource);
            $resource->update($validated);
            return $this->successResponse($resource->fresh(), 'Resource updated successfully');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Delete resource
     */
    public function destroy($id): JsonResponse
    {
        try {
            $resource = $this->model->findOrFail($id);
            $resource->delete();
            return $this->successResponse(null, 'Resource deleted successfully');
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Validate request data - override in child controllers
     * This method should be overridden in child controllers to provide specific validation rules
     */
    protected function validateRequest(Request $request, $resource = null): array
    {
        // Default validation - override in child controllers
        // Child controllers should implement proper validation rules
        return $request->all();
    }

    /**
     * Helper method to validate request with custom rules
     */
    protected function validateWith(Request $request, array $rules, array $messages = []): array
    {
        return $request->validate($rules, $messages);
    }

    /**
     * Set searchable columns
     */
    protected function setSearchableColumns(array $columns): self
    {
        $this->searchableColumns = $columns;
        return $this;
    }

    /**
     * Set filterable columns
     */
    protected function setFilterableColumns(array $columns): self
    {
        $this->filterableColumns = $columns;
        return $this;
    }

    /**
     * Set sortable columns
     */
    protected function setSortableColumns(array $columns): self
    {
        $this->sortableColumns = $columns;
        return $this;
    }
}
