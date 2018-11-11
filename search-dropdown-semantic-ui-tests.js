// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by search-dropdown-semantic-ui.js.
import { name as packageName } from "meteor/perfectsofttunisia:search-dropdown-semantic-ui";

// Write your tests here!
// Here is an example.
Tinytest.add('search-dropdown-semantic-ui - example', function (test) {
  test.equal(packageName, "search-dropdown-semantic-ui");
});
