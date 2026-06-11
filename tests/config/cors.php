<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Адрес фронтенда (Vite dev-сервер по умолчанию).
    // На проде заменить через переменную окружения.
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-токены → куки не нужны
    'supports_credentials' => false,

];
