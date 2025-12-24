<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| All routes point to the SPA (React app)
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
