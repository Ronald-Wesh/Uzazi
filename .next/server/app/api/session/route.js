/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/session/route";
exports.ids = ["app/api/session/route"];
exports.modules = {

/***/ "(rsc)/./app/api/session/route.ts":
/*!**********************************!*\
  !*** ./app/api/session/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_auth_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth-server */ \"(rsc)/./lib/auth-server.ts\");\n\n\n\nasync function POST(request) {\n    const body = await request.json();\n    if (!body.token || !body.role) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"A Firebase token and role are required.\"\n        }, {\n            status: 400\n        });\n    }\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: true\n    });\n    const roleToken = await (0,_lib_auth_server__WEBPACK_IMPORTED_MODULE_2__.signRoleToken)(body.role);\n    const secure = \"development\" === \"production\";\n    response.cookies.set(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.SESSION_COOKIE_NAME, body.token, {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure,\n        path: \"/\",\n        maxAge: _lib_auth__WEBPACK_IMPORTED_MODULE_1__.SESSION_MAX_AGE\n    });\n    response.cookies.set(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.ROLE_COOKIE_NAME, roleToken, {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure,\n        path: \"/\",\n        maxAge: _lib_auth__WEBPACK_IMPORTED_MODULE_1__.SESSION_MAX_AGE\n    });\n    return response;\n}\nasync function DELETE() {\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: true\n    });\n    response.cookies.set(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.SESSION_COOKIE_NAME, \"\", {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure: \"development\" === \"production\",\n        path: \"/\",\n        maxAge: 0\n    });\n    response.cookies.set(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.ROLE_COOKIE_NAME, \"\", {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure: \"development\" === \"production\",\n        path: \"/\",\n        maxAge: 0\n    });\n    return response;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Nlc3Npb24vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBMkM7QUFFeUM7QUFDbEM7QUFRM0MsZUFBZUssS0FBS0MsT0FBZ0I7SUFDekMsTUFBTUMsT0FBUSxNQUFNRCxRQUFRRSxJQUFJO0lBRWhDLElBQUksQ0FBQ0QsS0FBS0UsS0FBSyxJQUFJLENBQUNGLEtBQUtHLElBQUksRUFBRTtRQUM3QixPQUFPVixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQUVHLE9BQU87UUFBMEMsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDL0Y7SUFFQSxNQUFNQyxXQUFXYixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVNLFNBQVM7SUFBSztJQUNuRCxNQUFNQyxZQUFZLE1BQU1YLCtEQUFhQSxDQUFDRyxLQUFLRyxJQUFJO0lBQy9DLE1BQU1NLFNBQVNDLGtCQUF5QjtJQUV4Q0osU0FBU0ssT0FBTyxDQUFDQyxHQUFHLENBQUNqQiwwREFBbUJBLEVBQUVLLEtBQUtFLEtBQUssRUFBRTtRQUNwRFcsVUFBVTtRQUNWQyxVQUFVO1FBQ1ZMO1FBQ0FNLE1BQU07UUFDTkMsUUFBUXBCLHNEQUFlQTtJQUN6QjtJQUVBVSxTQUFTSyxPQUFPLENBQUNDLEdBQUcsQ0FBQ2xCLHVEQUFnQkEsRUFBRWMsV0FBVztRQUNoREssVUFBVTtRQUNWQyxVQUFVO1FBQ1ZMO1FBQ0FNLE1BQU07UUFDTkMsUUFBUXBCLHNEQUFlQTtJQUN6QjtJQUVBLE9BQU9VO0FBQ1Q7QUFFTyxlQUFlVztJQUNwQixNQUFNWCxXQUFXYixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVNLFNBQVM7SUFBSztJQUVuREQsU0FBU0ssT0FBTyxDQUFDQyxHQUFHLENBQUNqQiwwREFBbUJBLEVBQUUsSUFBSTtRQUM1Q2tCLFVBQVU7UUFDVkMsVUFBVTtRQUNWTCxRQUFRQyxrQkFBeUI7UUFDakNLLE1BQU07UUFDTkMsUUFBUTtJQUNWO0lBRUFWLFNBQVNLLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDbEIsdURBQWdCQSxFQUFFLElBQUk7UUFDekNtQixVQUFVO1FBQ1ZDLFVBQVU7UUFDVkwsUUFBUUMsa0JBQXlCO1FBQ2pDSyxNQUFNO1FBQ05DLFFBQVE7SUFDVjtJQUVBLE9BQU9WO0FBQ1QiLCJzb3VyY2VzIjpbIi9ob21lL3JvbmFsZC9EZXNrdG9wL1BlcnNvbmFsLVByb2plY3RzL1V6YXppL2FwcC9hcGkvc2Vzc2lvbi9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcblxuaW1wb3J0IHsgUk9MRV9DT09LSUVfTkFNRSwgU0VTU0lPTl9DT09LSUVfTkFNRSwgU0VTU0lPTl9NQVhfQUdFIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcbmltcG9ydCB7IHNpZ25Sb2xlVG9rZW4gfSBmcm9tIFwiQC9saWIvYXV0aC1zZXJ2ZXJcIjtcbmltcG9ydCB0eXBlIHsgVXNlclJvbGUgfSBmcm9tIFwiQC9saWIvdHlwZXNcIjtcblxuaW50ZXJmYWNlIFNlc3Npb25SZXF1ZXN0IHtcbiAgdG9rZW4/OiBzdHJpbmc7XG4gIHJvbGU/OiBVc2VyUm9sZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICBjb25zdCBib2R5ID0gKGF3YWl0IHJlcXVlc3QuanNvbigpKSBhcyBTZXNzaW9uUmVxdWVzdDtcblxuICBpZiAoIWJvZHkudG9rZW4gfHwgIWJvZHkucm9sZSkge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkEgRmlyZWJhc2UgdG9rZW4gYW5kIHJvbGUgYXJlIHJlcXVpcmVkLlwiIH0sIHsgc3RhdHVzOiA0MDAgfSk7XG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgY29uc3Qgcm9sZVRva2VuID0gYXdhaXQgc2lnblJvbGVUb2tlbihib2R5LnJvbGUpO1xuICBjb25zdCBzZWN1cmUgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCI7XG5cbiAgcmVzcG9uc2UuY29va2llcy5zZXQoU0VTU0lPTl9DT09LSUVfTkFNRSwgYm9keS50b2tlbiwge1xuICAgIGh0dHBPbmx5OiB0cnVlLFxuICAgIHNhbWVTaXRlOiBcImxheFwiLFxuICAgIHNlY3VyZSxcbiAgICBwYXRoOiBcIi9cIixcbiAgICBtYXhBZ2U6IFNFU1NJT05fTUFYX0FHRSxcbiAgfSk7XG5cbiAgcmVzcG9uc2UuY29va2llcy5zZXQoUk9MRV9DT09LSUVfTkFNRSwgcm9sZVRva2VuLCB7XG4gICAgaHR0cE9ubHk6IHRydWUsXG4gICAgc2FtZVNpdGU6IFwibGF4XCIsXG4gICAgc2VjdXJlLFxuICAgIHBhdGg6IFwiL1wiLFxuICAgIG1heEFnZTogU0VTU0lPTl9NQVhfQUdFLFxuICB9KTtcblxuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBERUxFVEUoKSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xuXG4gIHJlc3BvbnNlLmNvb2tpZXMuc2V0KFNFU1NJT05fQ09PS0lFX05BTUUsIFwiXCIsIHtcbiAgICBodHRwT25seTogdHJ1ZSxcbiAgICBzYW1lU2l0ZTogXCJsYXhcIixcbiAgICBzZWN1cmU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIixcbiAgICBwYXRoOiBcIi9cIixcbiAgICBtYXhBZ2U6IDAsXG4gIH0pO1xuXG4gIHJlc3BvbnNlLmNvb2tpZXMuc2V0KFJPTEVfQ09PS0lFX05BTUUsIFwiXCIsIHtcbiAgICBodHRwT25seTogdHJ1ZSxcbiAgICBzYW1lU2l0ZTogXCJsYXhcIixcbiAgICBzZWN1cmU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIixcbiAgICBwYXRoOiBcIi9cIixcbiAgICBtYXhBZ2U6IDAsXG4gIH0pO1xuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJST0xFX0NPT0tJRV9OQU1FIiwiU0VTU0lPTl9DT09LSUVfTkFNRSIsIlNFU1NJT05fTUFYX0FHRSIsInNpZ25Sb2xlVG9rZW4iLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJqc29uIiwidG9rZW4iLCJyb2xlIiwiZXJyb3IiLCJzdGF0dXMiLCJyZXNwb25zZSIsInN1Y2Nlc3MiLCJyb2xlVG9rZW4iLCJzZWN1cmUiLCJwcm9jZXNzIiwiY29va2llcyIsInNldCIsImh0dHBPbmx5Iiwic2FtZVNpdGUiLCJwYXRoIiwibWF4QWdlIiwiREVMRVRFIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/session/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth-server.ts":
/*!****************************!*\
  !*** ./lib/auth-server.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ROLE_COOKIE_NAME: () => (/* reexport safe */ _lib_auth__WEBPACK_IMPORTED_MODULE_0__.ROLE_COOKIE_NAME),\n/* harmony export */   SESSION_COOKIE_NAME: () => (/* reexport safe */ _lib_auth__WEBPACK_IMPORTED_MODULE_0__.SESSION_COOKIE_NAME),\n/* harmony export */   signRoleToken: () => (/* binding */ signRoleToken),\n/* harmony export */   verifyRoleToken: () => (/* binding */ verifyRoleToken),\n/* harmony export */   verifySessionCookie: () => (/* binding */ verifySessionCookie)\n/* harmony export */ });\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/jwks/remote.js\");\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/jwt/sign.js\");\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/jwt/verify.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\n\nconst secureTokenJwks = (0,jose__WEBPACK_IMPORTED_MODULE_1__.createRemoteJWKSet)(new URL(\"https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com\"));\nfunction getSessionSecret() {\n    const secret = process.env.UZAZI_SESSION_SECRET ?? \"1:866043638897:web:5133bf454f710ab67d97d0\" ?? \"uzazi-dev-session-secret\";\n    return new TextEncoder().encode(secret);\n}\nasync function signRoleToken(role) {\n    return new jose__WEBPACK_IMPORTED_MODULE_2__.SignJWT({\n        role\n    }).setProtectedHeader({\n        alg: \"HS256\"\n    }).setIssuedAt().setExpirationTime(\"5d\").sign(getSessionSecret());\n}\nasync function verifyRoleToken(token) {\n    try {\n        const { payload } = await (0,jose__WEBPACK_IMPORTED_MODULE_3__.jwtVerify)(token, getSessionSecret(), {\n            algorithms: [\n                \"HS256\"\n            ]\n        });\n        return payload.role ?? null;\n    } catch  {\n        return null;\n    }\n}\nasync function verifySessionCookie(token, projectId) {\n    try {\n        const { payload } = await (0,jose__WEBPACK_IMPORTED_MODULE_3__.jwtVerify)(token, secureTokenJwks, {\n            issuer: [\n                `https://securetoken.google.com/${projectId}`,\n                `https://session.firebase.google.com/${projectId}`\n            ],\n            audience: projectId\n        });\n        return payload;\n    } catch  {\n        return null;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC1zZXJ2ZXIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQThEO0FBRUs7QUFHbEI7QUFFakQsTUFBTUssa0JBQWtCTCx3REFBa0JBLENBQ3hDLElBQUlNLElBQ0Y7QUFJSixTQUFTQztJQUNQLE1BQU1DLFNBQ0pDLFFBQVFDLEdBQUcsQ0FBQ0Msb0JBQW9CLElBQ2hDRiwyQ0FBdUMsSUFDdkM7SUFFRixPQUFPLElBQUlJLGNBQWNDLE1BQU0sQ0FBQ047QUFDbEM7QUFFTyxlQUFlTyxjQUFjQyxJQUFjO0lBQ2hELE9BQU8sSUFBSWQseUNBQU9BLENBQUM7UUFBRWM7SUFBSyxHQUN2QkMsa0JBQWtCLENBQUM7UUFBRUMsS0FBSztJQUFRLEdBQ2xDQyxXQUFXLEdBQ1hDLGlCQUFpQixDQUFDLE1BQ2xCQyxJQUFJLENBQUNkO0FBQ1Y7QUFFTyxlQUFlZSxnQkFBZ0JDLEtBQWE7SUFDakQsSUFBSTtRQUNGLE1BQU0sRUFBRUMsT0FBTyxFQUFFLEdBQUcsTUFBTXZCLCtDQUFTQSxDQUFzQnNCLE9BQU9oQixvQkFBb0I7WUFDbEZrQixZQUFZO2dCQUFDO2FBQVE7UUFDdkI7UUFFQSxPQUFPRCxRQUFRUixJQUFJLElBQUk7SUFDekIsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxlQUFlVSxvQkFBb0JILEtBQWEsRUFBRUksU0FBaUI7SUFDeEUsSUFBSTtRQUNGLE1BQU0sRUFBRUgsT0FBTyxFQUFFLEdBQUcsTUFBTXZCLCtDQUFTQSxDQUFDc0IsT0FBT2xCLGlCQUFpQjtZQUMxRHVCLFFBQVE7Z0JBQ04sQ0FBQywrQkFBK0IsRUFBRUQsV0FBVztnQkFDN0MsQ0FBQyxvQ0FBb0MsRUFBRUEsV0FBVzthQUNuRDtZQUNERSxVQUFVRjtRQUNaO1FBRUEsT0FBT0g7SUFDVCxFQUFFLE9BQU07UUFDTixPQUFPO0lBQ1Q7QUFDRiIsInNvdXJjZXMiOlsiL2hvbWUvcm9uYWxkL0Rlc2t0b3AvUGVyc29uYWwtUHJvamVjdHMvVXphemkvbGliL2F1dGgtc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVJlbW90ZUpXS1NldCwgand0VmVyaWZ5LCBTaWduSldUIH0gZnJvbSBcImpvc2VcIjtcblxuaW1wb3J0IHsgUk9MRV9DT09LSUVfTkFNRSwgU0VTU0lPTl9DT09LSUVfTkFNRSB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5pbXBvcnQgdHlwZSB7IFVzZXJSb2xlIH0gZnJvbSBcIkAvbGliL3R5cGVzXCI7XG5cbmV4cG9ydCB7IFJPTEVfQ09PS0lFX05BTUUsIFNFU1NJT05fQ09PS0lFX05BTUUgfTtcblxuY29uc3Qgc2VjdXJlVG9rZW5Kd2tzID0gY3JlYXRlUmVtb3RlSldLU2V0KFxuICBuZXcgVVJMKFxuICAgIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vc2VydmljZV9hY2NvdW50cy92MS9qd2svc2VjdXJldG9rZW5Ac3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb21cIixcbiAgKSxcbik7XG5cbmZ1bmN0aW9uIGdldFNlc3Npb25TZWNyZXQoKSB7XG4gIGNvbnN0IHNlY3JldCA9XG4gICAgcHJvY2Vzcy5lbnYuVVpBWklfU0VTU0lPTl9TRUNSRVQgPz9cbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19GSVJFQkFTRV9BUFBfSUQgPz9cbiAgICBcInV6YXppLWRldi1zZXNzaW9uLXNlY3JldFwiO1xuXG4gIHJldHVybiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VjcmV0KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25Sb2xlVG9rZW4ocm9sZTogVXNlclJvbGUpIHtcbiAgcmV0dXJuIG5ldyBTaWduSldUKHsgcm9sZSB9KVxuICAgIC5zZXRQcm90ZWN0ZWRIZWFkZXIoeyBhbGc6IFwiSFMyNTZcIiB9KVxuICAgIC5zZXRJc3N1ZWRBdCgpXG4gICAgLnNldEV4cGlyYXRpb25UaW1lKFwiNWRcIilcbiAgICAuc2lnbihnZXRTZXNzaW9uU2VjcmV0KCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5Um9sZVRva2VuKHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPFVzZXJSb2xlIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gYXdhaXQgand0VmVyaWZ5PHsgcm9sZT86IFVzZXJSb2xlIH0+KHRva2VuLCBnZXRTZXNzaW9uU2VjcmV0KCksIHtcbiAgICAgIGFsZ29yaXRobXM6IFtcIkhTMjU2XCJdLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBheWxvYWQucm9sZSA/PyBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5U2Vzc2lvbkNvb2tpZSh0b2tlbjogc3RyaW5nLCBwcm9qZWN0SWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gYXdhaXQgand0VmVyaWZ5KHRva2VuLCBzZWN1cmVUb2tlbkp3a3MsIHtcbiAgICAgIGlzc3VlcjogW1xuICAgICAgICBgaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tLyR7cHJvamVjdElkfWAsXG4gICAgICAgIGBodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS8ke3Byb2plY3RJZH1gLFxuICAgICAgXSxcbiAgICAgIGF1ZGllbmNlOiBwcm9qZWN0SWQsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcGF5bG9hZDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJjcmVhdGVSZW1vdGVKV0tTZXQiLCJqd3RWZXJpZnkiLCJTaWduSldUIiwiUk9MRV9DT09LSUVfTkFNRSIsIlNFU1NJT05fQ09PS0lFX05BTUUiLCJzZWN1cmVUb2tlbkp3a3MiLCJVUkwiLCJnZXRTZXNzaW9uU2VjcmV0Iiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIlVaQVpJX1NFU1NJT05fU0VDUkVUIiwiTkVYVF9QVUJMSUNfRklSRUJBU0VfQVBQX0lEIiwiVGV4dEVuY29kZXIiLCJlbmNvZGUiLCJzaWduUm9sZVRva2VuIiwicm9sZSIsInNldFByb3RlY3RlZEhlYWRlciIsImFsZyIsInNldElzc3VlZEF0Iiwic2V0RXhwaXJhdGlvblRpbWUiLCJzaWduIiwidmVyaWZ5Um9sZVRva2VuIiwidG9rZW4iLCJwYXlsb2FkIiwiYWxnb3JpdGhtcyIsInZlcmlmeVNlc3Npb25Db29raWUiLCJwcm9qZWN0SWQiLCJpc3N1ZXIiLCJhdWRpZW5jZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth-server.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ROLE_COOKIE_NAME: () => (/* binding */ ROLE_COOKIE_NAME),\n/* harmony export */   SESSION_COOKIE_NAME: () => (/* binding */ SESSION_COOKIE_NAME),\n/* harmony export */   SESSION_MAX_AGE: () => (/* binding */ SESSION_MAX_AGE),\n/* harmony export */   getDefaultRouteForRole: () => (/* binding */ getDefaultRouteForRole),\n/* harmony export */   getRequiredRole: () => (/* binding */ getRequiredRole),\n/* harmony export */   isPublicPath: () => (/* binding */ isPublicPath)\n/* harmony export */ });\nconst SESSION_COOKIE_NAME = \"__session\";\nconst ROLE_COOKIE_NAME = \"uzazi-role\";\nconst SESSION_MAX_AGE = 60 * 60 * 24 * 5;\nconst MOTHER_ROUTES = [\n    \"/dashboard\",\n    \"/checkin\",\n    \"/companion\",\n    \"/garden\"\n];\nconst CHW_ROUTES = [\n    \"/triage\",\n    \"/mothers\",\n    \"/visit\"\n];\nconst PUBLIC_ROUTES = [\n    \"/\",\n    \"/login\",\n    \"/register\"\n];\nfunction isPublicPath(pathname) {\n    return PUBLIC_ROUTES.includes(pathname);\n}\nfunction getDefaultRouteForRole(role) {\n    if (role === \"chw\" || role === \"admin\") {\n        return \"/triage\";\n    }\n    return \"/dashboard\";\n}\nfunction getRequiredRole(pathname) {\n    if (pathname.startsWith(\"/mother/\")) {\n        return \"mother\";\n    }\n    if (pathname.startsWith(\"/chw/\")) {\n        return \"chw\";\n    }\n    if (MOTHER_ROUTES.some((route)=>pathname === route || pathname.startsWith(`${route}/`))) {\n        return \"mother\";\n    }\n    if (CHW_ROUTES.some((route)=>pathname === route || pathname.startsWith(`${route}/`))) {\n        return \"chw\";\n    }\n    return null;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFTyxNQUFNQSxzQkFBc0IsWUFBWTtBQUN4QyxNQUFNQyxtQkFBbUIsYUFBYTtBQUN0QyxNQUFNQyxrQkFBa0IsS0FBSyxLQUFLLEtBQUssRUFBRTtBQUVoRCxNQUFNQyxnQkFBZ0I7SUFBQztJQUFjO0lBQVk7SUFBYztDQUFVO0FBQ3pFLE1BQU1DLGFBQWE7SUFBQztJQUFXO0lBQVk7Q0FBUztBQUNwRCxNQUFNQyxnQkFBZ0I7SUFBQztJQUFLO0lBQVU7Q0FBWTtBQUUzQyxTQUFTQyxhQUFhQyxRQUFnQjtJQUMzQyxPQUFPRixjQUFjRyxRQUFRLENBQUNEO0FBQ2hDO0FBRU8sU0FBU0UsdUJBQXVCQyxJQUFpQztJQUN0RSxJQUFJQSxTQUFTLFNBQVNBLFNBQVMsU0FBUztRQUN0QyxPQUFPO0lBQ1Q7SUFFQSxPQUFPO0FBQ1Q7QUFFTyxTQUFTQyxnQkFBZ0JKLFFBQWdCO0lBQzlDLElBQUlBLFNBQVNLLFVBQVUsQ0FBQyxhQUFhO1FBQ25DLE9BQU87SUFDVDtJQUVBLElBQUlMLFNBQVNLLFVBQVUsQ0FBQyxVQUFVO1FBQ2hDLE9BQU87SUFDVDtJQUVBLElBQUlULGNBQWNVLElBQUksQ0FBQyxDQUFDQyxRQUFVUCxhQUFhTyxTQUFTUCxTQUFTSyxVQUFVLENBQUMsR0FBR0UsTUFBTSxDQUFDLENBQUMsSUFBSTtRQUN6RixPQUFPO0lBQ1Q7SUFFQSxJQUFJVixXQUFXUyxJQUFJLENBQUMsQ0FBQ0MsUUFBVVAsYUFBYU8sU0FBU1AsU0FBU0ssVUFBVSxDQUFDLEdBQUdFLE1BQU0sQ0FBQyxDQUFDLElBQUk7UUFDdEYsT0FBTztJQUNUO0lBRUEsT0FBTztBQUNUIiwic291cmNlcyI6WyIvaG9tZS9yb25hbGQvRGVza3RvcC9QZXJzb25hbC1Qcm9qZWN0cy9VemF6aS9saWIvYXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFVzZXJSb2xlIH0gZnJvbSBcIkAvbGliL3R5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBTRVNTSU9OX0NPT0tJRV9OQU1FID0gXCJfX3Nlc3Npb25cIjtcbmV4cG9ydCBjb25zdCBST0xFX0NPT0tJRV9OQU1FID0gXCJ1emF6aS1yb2xlXCI7XG5leHBvcnQgY29uc3QgU0VTU0lPTl9NQVhfQUdFID0gNjAgKiA2MCAqIDI0ICogNTtcblxuY29uc3QgTU9USEVSX1JPVVRFUyA9IFtcIi9kYXNoYm9hcmRcIiwgXCIvY2hlY2tpblwiLCBcIi9jb21wYW5pb25cIiwgXCIvZ2FyZGVuXCJdO1xuY29uc3QgQ0hXX1JPVVRFUyA9IFtcIi90cmlhZ2VcIiwgXCIvbW90aGVyc1wiLCBcIi92aXNpdFwiXTtcbmNvbnN0IFBVQkxJQ19ST1VURVMgPSBbXCIvXCIsIFwiL2xvZ2luXCIsIFwiL3JlZ2lzdGVyXCJdO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQdWJsaWNQYXRoKHBhdGhuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFBVQkxJQ19ST1VURVMuaW5jbHVkZXMocGF0aG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFJvdXRlRm9yUm9sZShyb2xlOiBVc2VyUm9sZSB8IG51bGwgfCB1bmRlZmluZWQpIHtcbiAgaWYgKHJvbGUgPT09IFwiY2h3XCIgfHwgcm9sZSA9PT0gXCJhZG1pblwiKSB7XG4gICAgcmV0dXJuIFwiL3RyaWFnZVwiO1xuICB9XG5cbiAgcmV0dXJuIFwiL2Rhc2hib2FyZFwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVxdWlyZWRSb2xlKHBhdGhuYW1lOiBzdHJpbmcpOiBVc2VyUm9sZSB8IG51bGwge1xuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aChcIi9tb3RoZXIvXCIpKSB7XG4gICAgcmV0dXJuIFwibW90aGVyXCI7XG4gIH1cblxuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aChcIi9jaHcvXCIpKSB7XG4gICAgcmV0dXJuIFwiY2h3XCI7XG4gIH1cblxuICBpZiAoTU9USEVSX1JPVVRFUy5zb21lKChyb3V0ZSkgPT4gcGF0aG5hbWUgPT09IHJvdXRlIHx8IHBhdGhuYW1lLnN0YXJ0c1dpdGgoYCR7cm91dGV9L2ApKSkge1xuICAgIHJldHVybiBcIm1vdGhlclwiO1xuICB9XG5cbiAgaWYgKENIV19ST1VURVMuc29tZSgocm91dGUpID0+IHBhdGhuYW1lID09PSByb3V0ZSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKGAke3JvdXRlfS9gKSkpIHtcbiAgICByZXR1cm4gXCJjaHdcIjtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl0sIm5hbWVzIjpbIlNFU1NJT05fQ09PS0lFX05BTUUiLCJST0xFX0NPT0tJRV9OQU1FIiwiU0VTU0lPTl9NQVhfQUdFIiwiTU9USEVSX1JPVVRFUyIsIkNIV19ST1VURVMiLCJQVUJMSUNfUk9VVEVTIiwiaXNQdWJsaWNQYXRoIiwicGF0aG5hbWUiLCJpbmNsdWRlcyIsImdldERlZmF1bHRSb3V0ZUZvclJvbGUiLCJyb2xlIiwiZ2V0UmVxdWlyZWRSb2xlIiwic3RhcnRzV2l0aCIsInNvbWUiLCJyb3V0ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsession%2Froute&page=%2Fapi%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsession%2Froute.ts&appDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsession%2Froute&page=%2Fapi%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsession%2Froute.ts&appDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_ronald_Desktop_Personal_Projects_Uzazi_app_api_session_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/session/route.ts */ \"(rsc)/./app/api/session/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/session/route\",\n        pathname: \"/api/session\",\n        filename: \"route\",\n        bundlePath: \"app/api/session/route\"\n    },\n    resolvedPagePath: \"/home/ronald/Desktop/Personal-Projects/Uzazi/app/api/session/route.ts\",\n    nextConfigOutput,\n    userland: _home_ronald_Desktop_Personal_Projects_Uzazi_app_api_session_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjBfcmVhY3QtZG9tQDE5LjAuMF9yZWFjdEAxOS4wLjBfX3JlYWN0QDE5LjAuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZzZXNzaW9uJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzZXNzaW9uJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2Vzc2lvbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGcm9uYWxkJTJGRGVza3RvcCUyRlBlcnNvbmFsLVByb2plY3RzJTJGVXphemklMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRmhvbWUlMkZyb25hbGQlMkZEZXNrdG9wJTJGUGVyc29uYWwtUHJvamVjdHMlMkZVemF6aSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDcUI7QUFDbEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9ob21lL3JvbmFsZC9EZXNrdG9wL1BlcnNvbmFsLVByb2plY3RzL1V6YXppL2FwcC9hcGkvc2Vzc2lvbi9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc2Vzc2lvbi9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3Nlc3Npb25cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3Nlc3Npb24vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9yb25hbGQvRGVza3RvcC9QZXJzb25hbC1Qcm9qZWN0cy9VemF6aS9hcHAvYXBpL3Nlc3Npb24vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsession%2Froute&page=%2Fapi%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsession%2Froute.ts&appDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:https");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0","vendor-chunks/jose@5.10.0"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.0_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fsession%2Froute&page=%2Fapi%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsession%2Froute.ts&appDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fronald%2FDesktop%2FPersonal-Projects%2FUzazi&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();