/*
 *
 *  Air Horner
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

// Version 0.54

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('transitServiceWorker').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/scripts/app.js',
        '/views/main.html',
        '/scripts/controllers/main.js',
        '/services/transitFactory.js',
        "/bower_components/jquery/dist/jquery.js",
        "/bower_components/angular/angular.js",
        "/bower_components/bootstrap/dist/js/bootstrap.js",
        "/bower_components/angular-cookies/angular-cookies.js",
        "/bower_components/angular-resource/angular-resource.js",
        "/bower_components/angular-route/angular-route.js",
        "/bower_components/angular-sanitize/angular-sanitize.js",
        "/bower_components/angular-touch/angular-touch.js",
        "/bower_components/lovefield/dist/lovefield.min.js",
        "/bower_components/bootstrap/dist/css/bootstrap.css",
        "/styles/main.css",
        '/sw.js',
      ])
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
