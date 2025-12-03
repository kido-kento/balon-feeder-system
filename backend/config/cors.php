<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | ここではCORS（Cross-Origin Resource Sharing）の設定を行います。
    | フロントエンド（localhost:3000）からバックエンド（localhost:8000）への
    | APIリクエストを許可するための設定です。
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3100',  // Next.jsフロントエンド（開発環境）
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
