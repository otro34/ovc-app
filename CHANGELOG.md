# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 1.0.0 (2025-09-26)


### Bug Fixes

* add automatic volume repair for contract data inconsistencies ([d462120](https://github.com/otro34/ovc-app/commit/d4621202a19701694bb83c000046451db88239a9))
* add missing @vitest/coverage-v8 dependency for CI/CD ([4163043](https://github.com/otro34/ovc-app/commit/41630434e84218a6378a5f6ffcb32d7fa4acb8ef))
* **build:** resolve TypeScript and ESLint compatibility issues ([bd8136d](https://github.com/otro34/ovc-app/commit/bd8136d11a881c3ac32f689c340899a4b39cb3a0))
* **database:** corregir contexto de this en método populate ([273b513](https://github.com/otro34/ovc-app/commit/273b51387253b99f29e58f7f1f65f214158f25d1))
* implement cancel button functionality in contract details modal ([70da96b](https://github.com/otro34/ovc-app/commit/70da96b503da3205ebe31b458f4736f97d65a9aa))
* **navigation:** corregir rutas del menú lateral y limpiar logs ([f0c42d4](https://github.com/otro34/ovc-app/commit/f0c42d498233e6dd342623cc6e82680888356472))
* prevent negative attended volume error in order cancellation ([e294e75](https://github.com/otro34/ovc-app/commit/e294e75b22d787f7afae12ae35a7d64465157089))
* resolve all ESLint and TypeScript warnings ([b3e68ff](https://github.com/otro34/ovc-app/commit/b3e68ff99fb46a3e5743eb1675a13bb6807b5ab3))
* resolve all TypeScript compilation errors preventing CI/CD build ([5717774](https://github.com/otro34/ovc-app/commit/57177740ad0067d02b4d2866e17f3764df74a002))
* resolve contractService import error in purchase order creation ([c7c9bca](https://github.com/otro34/ovc-app/commit/c7c9bcad33aace9cfc1e84d70a31b7b5ba175ea0))
* resolve handleCancelOrder hoisting error in PurchaseOrders ([8e6cabc](https://github.com/otro34/ovc-app/commit/8e6cabca283aab4fd4d50a636ea4cd89a64f3421))


### Features

* **auth:** implementar sistema completo de gestión de sesión [HU-002] ([ac94b2f](https://github.com/otro34/ovc-app/commit/ac94b2f2441e21a2ef1c49eda83b3c7b522bf8d2))
* **auth:** implementar sistema de autenticación y login [HU-001] [#1](https://github.com/otro34/ovc-app/issues/1) ([2a8b542](https://github.com/otro34/ovc-app/commit/2a8b5427eb601bb336efadea0d3ec1d836d66d98))
* **clients:** implementar sistema completo de gestión de clientes [HU-003 a HU-006] ([6430e9a](https://github.com/otro34/ovc-app/commit/6430e9ac4bdc0a8f6b4efa831c45698431e2cf14))
* **contracts:** implementar sistema completo de gestión de contratos [HU-007 a HU-009] ([83d4c91](https://github.com/otro34/ovc-app/commit/83d4c91a17ef14b8181597d810c29f18b603e708))
* **contracts:** implementar vista detallada y edición controlada de contratos [HU-010, HU-011] ([12dc550](https://github.com/otro34/ovc-app/commit/12dc550a808d5d67b62611223ef6d681300ea4d1))
* **dashboard:** implement complete Dashboard and Reports system for Sprint 6 ([883425e](https://github.com/otro34/ovc-app/commit/883425ec85866cfe58d6aa1e49108129791ed202))
* **purchase-orders:** implement complete edit functionality for purchase orders ([a5082da](https://github.com/otro34/ovc-app/commit/a5082da345384ec1f1854ba2a2d30b5ba663a82e))
* **release:** implement semantic-release automation [HU-021, HU-022] ([d7b4f7a](https://github.com/otro34/ovc-app/commit/d7b4f7aa7bf61164e59100812d4bc8901b35d049))
* **system:** Complete Sprint 7 and enhance order status management ([2dbf9c1](https://github.com/otro34/ovc-app/commit/2dbf9c176d0409eb17d1583d31be99f22468f9a3))
