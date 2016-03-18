******TO RUN MOCHA TESTS*********
need to install the following node_modules

npm install -g mocha
npm install should --save-dev
npm install expect.js
npm install send
npm install request

******TO RUN SELENIUM TESTS*********** 
Selenium Ide must be installed as an addon in your Mozilla Firefox browser.
Instructions can be found here: http://www.seleniumhq.org/docs/02_selenium_ide.jsp

This test suite must be run with the tests placed in this order.

1. noUserTest
2. createUserTest
3. userExistsTest
4. loginTest
5. editTest
6. viewTest
7. searchTest

In order for the test suite to run more than once in a row, the second command of noUserTest (store command)
must change its target to an unused username.
