'use strict';

angular.module('bookreader')
  .controller('MainCtrl', function ($scope, $location) {
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var bookurl = getParameterByName('bookurl');
    var pages = getParameterByName('pages');

    console.log('start', getParameterByName('foo'));
   var br = new BookReader();
    $scope.br = br;

// Return the width of a given page.  Here we assume all images are 800 pixels wide
    br.getPageWidth = function(index) {
      return 800;
    }

// Return the height of a given page.  Here we assume all images are 1200 pixels high
    br.getPageHeight = function(index) {
      return 1200;
    }

// We load the images from archive.org -- you can modify this function to retrieve images
// using a different URL structure
    br.getPageURI = function(index, reduce, rotate) {
      return bookurl + (index+1) + '.jpg';
    }

// Return which side, left or right, that a given page should be displayed on
    br.getPageSide = function(index) {
      if (0 == (index & 0x1)) {
        return 'R';
      } else {
        return 'L';
      }
    }

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
    }

// For a given "accessible page index" return the page number in the book.
//
// For example, index 5 might correspond to "Page 1" if there is front matter such
// as a title page and table of contents.
    br.getPageNum = function(index) {
      return index+1;
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
    br.searchEngines.std = function (query) {

      var mapping = {
        name: 'surname',
        date: 'date',
        place: 'place',
        relative1: 'rel1',
        relative2: 'rel2',
        relative3: 'rel3'
      };

      var parts = [];
      Object.keys(query).forEach(function (key) {
        if (query[key]) {
          parts.push({k: mapping[key], v: query[key]});
        }
      });

      // TODO: Update this URL with the correct book ID
      var url = 'https://www.gengophers.com/api/books/89/search?' +
        parts.map(function (o) {return o.k + '=' + o.v;}).join('&');

      // Wrap the JSON call in a JSON-P wrapper for now
      return 'http://json2jsonp.com/?url=' + encodeURIComponent(url);
    };



// Let's go!
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
