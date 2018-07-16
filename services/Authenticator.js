(function ()
{
    'use strict';
    function Authenticator($cookies, $rootScope, $http, $state, Base64, localStorageService, UserDAO)
    {
        /*jshint camelcase:false*/
        function setupAuthorizationHeader(data)
        {
            $http.defaults.headers.common['Authorization'] = 'Token ' + Base64.encode(data);
            isAuthenticated = true;
        }

        /**
         * initialize to whatever is in the cookie, if anything
         */
        var cookieAuthdata = $cookies.get('token'), isAuthenticated = false,
                impersonate = localStorageService.get('impersonate');
        if (cookieAuthdata) {
            setupAuthorizationHeader(cookieAuthdata);
        }

        $rootScope.$on('event:auth-loginRequired', function ()
        {
            authenticator.logout();
        });


        var authenticator = {
            authenticate: function (email, password)
            {
                //delete auth header & cookie
                delete $http.defaults.headers.common.Authorization;
                $cookies.remove('token');
                return UserDAO.authenticate(email, password).then(function (data)
                {
                    authenticator.setToken(data.token);
                });
            },
            logout: function ()
            {
                isAuthenticated = false;
                document.execCommand('ClearAuthenticationCache');
                $cookies.remove('token');
                delete $http.defaults.headers.common.Authorization;
                if (localStorageService.get('impersonate')) {
                    authenticator.setToken(localStorageService.get('impersonate'));
                    impersonate = void 0;
                    localStorageService.remove('impersonate');
                    $state.go('usersList', {}, {reload: true});
                }
                else {
                    $rootScope.$broadcast('event:auth-loggedOut');
                    $state.go('productPage', {}, {reload: true})
                }
            },
            setToken: function (token)
            {
                isAuthenticated = true;
                if (null == token) {
                    throw new Error('Token may not be null or undefined');
                }
                $cookies.put('token', token);
                cookieAuthdata = token;
                setupAuthorizationHeader(token);
                $rootScope.loginOverlay = false;
            },
            impersonate: function (userId)
            {
                return UserDAO.impersonate(userId).then(function (token)
                {
                    localStorageService.set('impersonate', cookieAuthdata);
                    authenticator.setToken(token.token);
                    $rootScope.$broadcast('event:auth-loggedIn');
                });
            },
            isAuthenticated: function ()
            {
                return isAuthenticated;
            }
        };
        return authenticator;
    }

    function Base64()
    {
        var keyStr = 'ABCDEFGHIJKLMNOP' + 'QRSTUVWXYZabcdef' + 'ghijklmnopqrstuv' + 'wxyz0123456789+/' + '=';
        //noinspection JSUnusedGlobalSymbols
        return {
            encode: function (input)
            {
                var output = '';
                var chr1, chr2, chr3 = '';
                var enc1, enc2, enc3, enc4 = '';
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    /*jshint bitwise:false*/
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    //noinspection JSValidateTypes
                    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = '';
                    enc1 = enc2 = enc3 = enc4 = '';
                } while (i < input.length);

                return output;
            },

            decode: function (input)
            {
                var output = '';
                var chr1, chr2, chr3 = '';
                var enc1, enc2, enc3, enc4 = '';
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/=]/g;
                if (base64test.exec(input)) {
                    throw new Error('There were invalid base64 characters in the input text.\n' +
                            'Valid base64 characters are A-Z, a-z, 0-9, "+", "/",and "="\n' +
                            'Expect errors in decoding.');
                }
                //noinspection JSCheckFunctionSignatures
                input = input.replace(/[^A-Za-z0-9\+\/=]/g, '');

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    /*jshint bitwise:false*/
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 !== 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 !== 64) {
                        //noinspection JSValidateTypes
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = '';
                    enc1 = enc2 = enc3 = enc4 = '';

                } while (i < input.length);

                return output;
            }
        };
    }

    /**
     * Authenticator must be in different module than ExceptionHandler.
     */
    var module = angular.module('frontApp');
    module.factory('Authenticator', ['$cookies', '$rootScope', '$http', '$state', 'Base64', 'localStorageService', 'UserDAO', Authenticator]);
    module.factory('Base64', Base64);
})();
