<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Адрес фронтенда (Vite dev-сервер по умолчанию).
    // На проде заменить через переменную окружения.
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-токены → куки не нужны
    'supports_credentials' => false,

];
