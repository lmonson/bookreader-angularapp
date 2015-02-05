'use strict';

angular.module('bookreader')
  .controller('MainCtrl', function ($scope, $window, $http) {
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec($window.location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var bookurl = getParameterByName('bookurl');
    var pages = getParameterByName('pages');
    var bookId = getParameterByName('bookid') || (function () {
        console.error('Error: No book ID was provided.');
        return 89;
      }());

    console.log('start', bookurl, pages, bookId);
   var br = new BookReader();
    $scope.br = br;

    // DWQ I have no idea why getPageHeight is called with invalid page numbers, but it is
    var clamp = function(index, pageDims) {
      if (index < 0 || index == null || isNaN(index)) {
        index = 0;
      }
      else if (index >= pageDims.length) {
        index = pageDims.length - 1;
      }
      return index;
    };

// Return the width of a given page.
    br.getPageWidth = function(index) {
      return br.pageDims[clamp(index-1, br.pageDims)].w; // pageDims array is 0-based; it is populated by the $http request at the bottom
    };

// Return the height of a given page.
    br.getPageHeight = function(index) {
      return br.pageDims[clamp(index-1, br.pageDims)].h;
    };

// We load the images from archive.org -- you can modify this function to retrieve images
// using a different URL structure
    br.getPageURI = function(index, reduce, rotate) {
      return bookurl + index + '.jpg';
    };

// Return which side, left or right, that a given page should be displayed on
    br.getPageSide = function(index) {
      if (1 == (index & 0x1)) {
        return 'R';
      } else {
        return 'L';
      }
    };

// This function returns the left and right indices for the user-visible
// spread that contains the given index.  The return values may be
// null if there is no facing page or the index is invalid.
    br.getSpreadIndices = function(pindex) {
      var spreadIndices = [null, null];
      if ('rl' == this.pageProgression) {
        // Right to Left
        if (this.getPageSide(pindex) == 'R') {
          spreadIndices[1] = pindex;
          spreadIndices[0] = pindex + 1;
        } else {
          // Given index was LHS
          spreadIndices[0] = pindex;
          spreadIndices[1] = pindex - 1;
        }
      } else {
        // Left to right
        if (this.getPageSide(pindex) == 'L') {
          spreadIndices[0] = pindex;
          spreadIndices[1] = pindex + 1;
        } else {
          // Given index was RHS
          spreadIndices[1] = pindex;
          spreadIndices[0] = pindex - 1;
        }
      }

      return spreadIndices;
    };

// For a given "accessible page index" return the page number in the book.
//
// For example, index 5 might correspond to "Page 1" if there is front matter such
// as a title page and table of contents.
    br.getPageNum = function(index) {
      return index;
    }

// Total number of leafs
 //   br.numLeafs = 15;
    br.numLeafs = pages;

// Book title and the URL used for the book title link
    br.bookTitle= 'Open Library BookReader Presentation';
    br.bookUrl  = 'http://openlibrary.org';

// Override the path used to find UI images
    br.imagesBaseURL = 'assets/images/bookreader/';

    br.getEmbedCode = function(frameWidth, frameHeight, viewParams) {
      return "Embed code not supported in bookreader demo.";
    };



    /*
     This method is needed to display the search results, but isn't defined in BookReader.js so define it here.
     */
    br.leafNumToIndex = function (leafNum) {
      return leafNum;
    };


    /*
     Register the search endpoint.
     */
    br.searchEndpoints.std = function (query) {

      var parts = [];
      Object.keys(query).forEach(function (key) {
        if (query[key]) {
          parts.push({k: key, v: query[key]});
        }
      });

      // TODO: Update this URL with the correct book ID
      var url = '/api/books/' + bookId + '/search?' +
        parts.map(function (o) {return o.k + '=' + encodeURIComponent(o.v);}).join('&');

      return url;
    };



// Let's go!
    $http.get('/api/books/'+bookId+'/pagedims')
      .success(function(data) {
        br.pageDims = data.dimensions;

        br.init();

        // Show the initial search results
        var initialSearch = getParameterByName('initialsearch');
        if (initialSearch) {
          console.log("Initial search: " + initialSearch);
          br.fillSearchForm(JSON.parse(initialSearch));
          br.customSearch();
        }

// read-aloud and search need backend compenents and are not supported in the demo
//    $('#BRtoolbar').find('.read').hide();
//    $('#textSrch').hide();
//    $('#btnSrch').hide();

        console.log('end');
      });
      // TODO need to handle error case

  });
