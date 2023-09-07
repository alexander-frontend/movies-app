var app = angular.module('app', ['ngAnimate', 'ngMaterial']);

app.controller(
  'spinnerFilmCtrl',
  function ($scope, $mdDialog, $http, $timeout) {
    $scope.movieData = '';

    $scope.spinText = 'Let fate take the wheel...Have a spin';
    $scope.spinButtonText = 'Spin';
    $scope.spinningButtonText = 'Spinning...';
    $scope.spinAgainButtonText = 'Spin again';
    $scope.watchNowButtonText = 'Watch now';
    $scope.filterGenreLabel = 'Genre';
    $scope.filterYearLabel = 'Year';
    $scope.filterRatingLabel = 'Rating';

    $scope.filtersArr = [
      $scope.filterGenreLabel,
      $scope.filterYearLabel,
      $scope.filterRatingLabel,
    ];

    $scope.spinTimeout = 2000;

    $scope.isLoading = false;

    $scope.movie = '';

    $scope.showGreeting = showCustomGreeting;

    $scope.closeDialog = function () {
      // Easily hides most recent dialog shown...
      // no specific instance reference is needed.
      $mdDialog.hide();
    };

    $scope.genreOps = [
      {
        label: 'All genres',
        value: '0',
      },
      {
        label: 'Action',
        value: 'action',
      },
      {
        label: 'Action & Adventure',
        value: 'action & adventure',
      },
      {
        label: 'Animation',
        value: 'animation',
      },
      {
        label: 'Anime',
        value: 'anime',
      },
      {
        label: 'Biography',
        value: 'biography',
      },
      {
        label: 'Cartoon',
        value: 'cartoon',
      },
      {
        label: 'Children',
        value: 'children',
      },
      {
        label: 'Comedy',
        value: 'comedy',
      },
      {
        label: 'Cuit',
        value: 'cuit',
      },
      {
        label: 'Drama',
        value: 'drama',
      },
      {
        label: 'Family',
        value: 'family',
      },
      {
        label: 'Fantasy',
        value: 'fantasy',
      },
      {
        label: 'Musical',
        value: 'musical',
      },
      {
        label: 'Mystery',
        value: 'mystery',
      },
    ];

    $scope.yearOps = [
      {
        label: 'Any score',
        value: 0,
      },
      {
        label: '2007',
        value: 2007,
      },
      {
        label: '2008',
        value: 2008,
      },
      {
        label: '2009',
        value: 2009,
      },
      {
        label: '2010',
        value: 2010,
      },
      {
        label: '2011',
        value: 2011,
      },
      {
        label: '2012',
        value: 2012,
      },
      {
        label: '2013',
        value: 2013,
      },
      {
        label: '2014',
        value: 2014,
      },
      {
        label: '2015',
        value: 2015,
      },
      {
        label: '2016',
        value: 2016,
      },
      {
        label: '2017',
        value: 2017,
      },
      {
        label: '2018',
        value: 2018,
      },
      {
        label: '2019',
        value: 2019,
      },
      {
        label: '2020',
        value: 2020,
      },
      {
        label: '2021',
        value: 2021,
      },
      {
        label: '2022',
        value: 2022,
      },
      {
        label: '2023',
        value: 2023,
      },
    ];

    $scope.ratingOps = [
      {
        label: 'Any score',
        value: '0',
      },
      {
        label: '5',
        value: '5',
      },
      {
        label: '6',
        value: '6',
      },
      {
        label: '7',
        value: '7',
      },
      {
        label: '8',
        value: '8',
      },
      {
        label: '9',
        value: '9',
      },
    ];

    angular.forEach($scope.filtersArr, function (item) {
      $scope['selection' + item] = '0';
    });

    $http({
      method: 'get',
      url: '../sweettv-test/src/movies_list.json',
    }).then(
      function (response) {
        $scope.moviesData = response.data;
      },
      function (error) {
        console.log(error, 'can not get data.');
      }
    );

    $scope.spinMovie = function () {
      $scope.spinButtonText = $scope.spinningButtonText;
      $scope.movie = '';
      $scope.isLoading = true;

      var filterBy = {
        genre_type: $scope.selectionGenre,
        year: $scope.selectionYear,
        rating_score: $scope.selectionRating,
      };

      for (var key in filterBy) {
        if (filterBy[key] == 0) {
          delete filterBy[key];
        }
      }

      var filteredMovies = $scope.moviesData.filter(function (o) {
        return Object.keys(filterBy).every(function (k) {
          return [filterBy[k]].some(function (f) {
            return (
              (k == 'genre_type' && o[k].toLowerCase() == f.toLowerCase()) ||
              (k == 'rating_score' && Math.floor(o[k]) == Math.floor(f)) ||
              o[k] == f
            );
          });
        });
      });

      /* Artificial delay for displaying the loader */
      $timeout(function () {
        $scope.spinButtonText = $scope.spinAgainButtonText;

        if (filteredMovies && filteredMovies.length > 0) {
          var randomMovie =
            filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
          $scope.movie = angular.copy(randomMovie);
        }

        $scope.isLoading = false;
      }, $scope.spinTimeout);
    };

    function showCustomGreeting($event) {
      $mdDialog.show({
        targetEvent: $event,
        template:
          '<md-dialog style="overflow: hidden;">' +
          '  <md-content style="background: #000;overflow:hidden;"><video autoplay width="100%" src="https://vod4.sweet.tv/trailer/13918/uk/video-1080.mp4"></video></md-content>' +
          '  <div class="md-actions" style="position: absolute;top:0;right:0;color:#fff;width:100px;height:50px;">' +
          '    <md-button ng-click="closeDialog()">' +
          '      x' +
          '    </md-button>' +
          '  </div>' +
          '</md-dialog>',
        controller: 'spinnerFilmCtrl',
        clickOutsideToClose: true,
      });
    }
  }
);

app.directive('selectFilter', function () {
  function main(scope, element) {
    // Selecting model value
    for (var idx in scope.ops) {
      if (scope.ops[idx].value == scope.selection) {
        scope.selectedOpt = scope.ops[idx];
      }
    }

    // Is a mobile device
    var isMobile = false;
    if (/ipad|iphone|android/gi.test(window.navigator.userAgent)) {
      isMobile = true;
    }

    // Select an option
    scope.selectOpt = function (opt) {
      scope.selection = opt.value;
      labelDom.classList.remove('active');
      optionsDom.classList.remove('active');
      backdrop.classList.remove('active');
    };

    scope.$watch('selection', function (newVal) {
      for (var idx in scope.ops) {
        if (scope.ops[idx].value == newVal) {
          scope.selectedOpt = scope.ops[idx];
        }
      }
    });

    // DOM References
    var labelDom = element[0].querySelector('.custom-select-label');
    var optionsDom = element[0].querySelector('.custom-select-ops');
    var backdrop = element[0].querySelector('.custom-select-backdrop');
    var mobileSelect = element[0].querySelector('select');

    // DOM Event Listeners
    labelDom.addEventListener('click', function () {
      rePositionOps();
      labelDom.classList.toggle('active');
      optionsDom.classList.toggle('active');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', function () {
      labelDom.classList.remove('active');
      optionsDom.classList.remove('active');
      backdrop.classList.remove('active');
    });

    // Initialization
    rePositionOps();

    window.addEventListener('resize', function () {
      rePositionOps();
    });

    if (isMobile) {
      mobileSelect.classList.add('active');
    }

    // Positioning options
    function rePositionOps() {
      // Mobile ops
      mobileSelect.style.width = labelDom.clientWidth + 'px';
      mobileSelect.style.height = labelDom.clientHeight + 'px';
    }
  }

  return {
    link: main,
    scope: {
      ops: '=selectFilter',
      selection: '=selection',
    },
    template:
      "<div class='custom-select-label mt-2' tabindex='0' title='{{selectedOpt.label}}'><span class='custom-select-label-text'>{{selectedOpt.label}}</span><span class='custom-select-caret'><svg viewBox='0 0 100 60'><polyline points='10,10 50,50 90,10' style='fill:none;stroke:white;stroke-width:8;stroke-linecap:round;'/></svg></span></div><div class='custom-select-backdrop'></div><div class='custom-select-ops flex-column flex-wrap'><div ng-repeat='o in ops' ng-click='selectOpt(o)'>{{o.label}}</div></div><select ng-model='selection'><option ng-repeat='o in ops' value='{{o.value}}' label={{o.label}}>{{o.label}}</option></select>",
  };
});
