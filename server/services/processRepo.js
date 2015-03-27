'use strict';

var async = require('async');
var db = require('../../database.js').db;
var parseService = require('./parsing/readFilesForParsing.js');
var downloadService = require('./downloading/gitHubRepoGrabber.js');
var queryService = require('./query.js');
var fileSystemUtilities = require('./fileSystem/utilities.js');
var retirejs = require('./retirejs/retire.js');
var scanjs = require('./scanjs/scanner.js');

var processRepo = function(repoID) {
  console.log('RICH CHECK! repoID that processRepo() was given: ', repoID, typeof repoID);
  // gets individual records from the database and then returns an array with at least 3 of them
  console.log('starting queryService to get repo...');
  queryService.query(repoID, function(repoObj){
    // makes dirs and downloads repos for chosen repo
    console.log('starting downloadService to DL repos...');
    downloadService.readListOfFiles(repoObj, function(repoID){
      // db connection with our Repos
      var repos = db.get('Repos');
      var fullRelativePath = __dirname + '/../../git_data/' + repoID;

      // async library function that lets you run async functions in parallel and wait until 
      // they're all finished before continuing (we wait for each scan to finish before deleting files)
      async.series([
          // run scanjs
          function(callback){
            console.log('starting scanJS...');
            var scanResults;
            try {
              scanResults = scanjs.scanDir(fullRelativePath);  
            } catch (e) {
              console.log('ScanJS error!: ', e);
              scanResults = {'error': 'ScanJS failed... sorry!'};
            }
            
            if (!scanResults) {
              scanResults = {'clear': 'Congrats, nothing found!'};
            }

            // add scan results to the DB
            repos.findAndModify({repo_id: repoID}, {$set: {'repo_info.scan_results': JSON.stringify(scanResults)}}, function() {
              console.log('record updated with scanResults...');
              callback(null, 'scan');
            });
          },

          // run retirejs
          function(callback){
            console.log('starting retireJS...');

            var retireResults;
            try {
              retireResults = retirejs.retireScan(fullRelativePath);
            } catch (e) {
              console.log('retireJS error!: ', e);
              retireResults = {'error': 'RetireJS failed... sorry!'};
            }

            if (!retireResults) {
              retireResults = {'clear': 'Congrats, nothing found!'};
            }

            // add retire results to the DB
            repos.findAndModify({repo_id: repoID}, {$set: {'repo_info.retire_results': retireResults}}, function(err) {
              if (err) {
                console.log('db err: ', err);
              }
              console.log('record updated with retireResults...');
              callback(null, 'retire');
            });
          },

          // run api_key scanning (this one requires a callback... technical debt)
          function(callback){
            console.log('starting api_key scan...');
            try {
              parseService.parseFile(repoID, function(parseResults) {
                if (!parseResults) {
                  parseResults = {'clear': 'Congrats, nothing found!'};
                }

                repos.findAndModify({repo_id: repoID}, {$set: {'repo_info.parse_results': JSON.stringify(parseResults)}}, function() {
                  console.log('record updated with parseResults...');
                  callback(null, 'parse');
                });
              });
            } catch (e) {
              console.log('apikey parsing error!: ', e);
              var parseResults = {'error': 'apikey parsing failed... sorry!'};
              repos.findAndModify({repo_id: repoID}, {$set: {'repo_info.parse_results': parseResults}}, function() {
                console.log('record updated with parseResults...');
                callback(null, 'parse');
              });
            }
          }
      ],

      // called once all three fn's above are done
      function(err){
          if (err) {
            console.log('something went wrong in the parallel exec!');
            console.log('error: ', err);
          } else {
            // delete the repo here
            console.log('Removing repoID: ', repoID);
            fileSystemUtilities.removeDirectoryAsync(__dirname + '/git_data/' + repoID);  
          }
      });

    });
  });
};

exports.processRepo = processRepo;
