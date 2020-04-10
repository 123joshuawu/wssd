import 'bootstrap/dist/css/bootstrap.css';

import angular from 'angular';

import 'angular-animate';

const API_BASE_URL = 'https://api.publicapis.org';

const app = angular.module('app', ['ngAnimate']);

app.controller("mainController", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    $scope.log = console.log

    $scope.trustSrc = (src) => {
        return $sce.trustAsResourceUrl(src);
    }

    // $scope.checkLink = (link, callback) => {
    //     if (link === undefined || link === null) {
    //         callback(false);
    //     }

    //     $http
    //         .get(link)
    //         .then(
    //             ({ headers }) => callback(!headers('x-frame-options')),
    //             ({ headers }) => callback(!headers('x-frame-options')) 
    //         );
    // }

    $scope.mainViewList = [{}];
    $scope.categoriesList = [];

    $http
        .get(API_BASE_URL + '/categories')
        .then(
            ({ data }) => {
                data.forEach((i) => {
                    $scope.categoriesList.push(i);
                });
            }
        );

    $scope.getRandom = (params) => {
        $http({
            method: 'GET',
            url: API_BASE_URL + '/random',
            params
        }).then(({data}) => {
            data.entries.forEach((api, index) => {
                api.canFrameLink = true;

                // $scope.checkLink(api.Link, (canFrame) => {
                //     let obj = $scope.mainViewList[index];
                //     if (api.API === obj.API) {
                //         api.canFrameLink = canFrame;
                //     }
                // });

                $('body').children('.card').eq($scope.mainViewList[0].API ? 1 : 0).addClass(['ng-move', 'ng-move-active']);
   
                if ($scope.mainViewList.length > 1) {
 
                    $scope.mainViewList.splice(0, 1);
                }

                $scope.mainViewList.push(api);
            });
        });
    };

    $scope.mainViewList.push({
        Category: 'Open Data',
        API: 'Public API for Public APIs',
        Description: 'Welcome to the nonofficial interface for the official public API for the public-apis project!',
        Link: 'https://github.com/davemachado/public-api',
        Auth: 'None',
        Cors: 'yes',
        HTTPS: true,
        canFrameLink: false
    });
}]);