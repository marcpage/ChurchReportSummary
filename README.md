# ChurchReportSummary
TamperMonkey script to create a summary of the custom reports from "Create Report" function of the Leader and Clerk Resource area.

Note that often after loading a report or changing a report, TamperMonkey will not run the script. You can reload the page to force the tables to generate.

**How to use**

Install the browser plugin TamperMonkey. Open the TamperMonkey Dashboard and go to the Utilities tab. In the Install from URL section, paste in:

https://raw.githubusercontent.com/marcpage/ChurchReportSummary/main/ChurchReportSummary.js

And then click the Install button.

Log into https://ChurchOfJesusChrist.org/ and go to the Leader and Clerk Resources under My Account and Ward.

Under Reports go to Create a Report. Select an existing report or create a new report. When the report is shown, if a table does not appear after the report, then refresh the page.

The tables will be generated based on all fields in the table which are not mostly unique (ie unit, age, etc will be used but name will not be). A table will be created for every pair of grouping fields.

<img width="1156" alt="Screen Shot 2021-04-25 at 11 09 11 AM" src="https://user-images.githubusercontent.com/695749/116000688-e6d0b300-a5b6-11eb-914b-f1410acc3e64.png">

