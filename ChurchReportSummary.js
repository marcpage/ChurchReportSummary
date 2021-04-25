// ==UserScript==
// @name         Stake Youth
// @namespace    https://github.com/marcpage/ChurchReportSummary
// @version      0.1
// @description  Gather youth temple recommend statistics by unit
// @author       Marc Page
// @updateURL    https://raw.githubusercontent.com/marcpage/ChurchReportSummary/main/ChurchReportSummary.js
// @downloadURL  https://raw.githubusercontent.com/marcpage/ChurchReportSummary/main/ChurchReportSummary.js
// @match        https://lcr.churchofjesuschrist.org/report/custom-reports-details/*
// @icon         https://lcr.churchofjesuschrist.org/favicon.ico
// @grant        none
// ==/UserScript==

function get_table_data() {
    'use strict';
    var table = document.getElementsByTagName("table")[0];
    var headers = table.getElementsByTagName("thead")[0].getElementsByTagName("th");
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    var header_names = [];
    var information = [];

    for (var header_index = 0; header_index < headers.length; ++header_index) {
        header_names.push(headers[header_index].innerText.trim());
    }

    for (var row_index = 0; row_index < rows.length; ++row_index) {
        var fields = rows[row_index].getElementsByTagName("td");
        var record = {};

        for (var field_index = 0; field_index < fields.length; ++field_index) {
            record[header_names[field_index]] = fields[field_index].innerText.trim();
        }
        information.push(record);
    }
    return information;
}

function get_data_grouping_keys(table_data) {
    var key_values = {};

    for (var row_index = 0; row_index < table_data.length; ++row_index) {
        var keys = Object.keys(table_data[row_index]);

        for (var key_index = 0; key_index < keys.length; ++key_index) {
            var key = keys[key_index];
            if (!key_values[key]) {
                key_values[key] = new Set();
            }

            key_values[key].add(table_data[row_index][key]);
        }
    }

    var all_keys = Object.keys(key_values);
    var grouping_keys = [];

    for (var all_key_index = 0; all_key_index < all_keys.length; ++all_key_index) {
        if (key_values[all_keys[all_key_index]].size < table_data.length/2) {
            grouping_keys.push(all_keys[all_key_index]);
        }
    }
    return grouping_keys;
}

function array_without_value(arr, remove) {
    return arr.filter(function(value, index, arr) {return value != remove;});
}

function rows_with_key_value(table_data, key, key_value) {
    return table_data.filter(function(value, index, arr) {return value[key] == key_value;});
}

function unique_column_values(table_data, key) {
    return table_data.map(x => x[key]).filter(function(value, index, arr) {return arr.indexOf(value) == index;});
}

function generate_display_table_data(table_data, keys) {
    var display_data = {"__count__": table_data.length};

    if (keys.length > 0) {
        for (var key_index = 0; key_index < keys.length; ++key_index) {
            var key = keys[key_index];
            var other_keys = array_without_value(keys, key);
            var values = unique_column_values(table_data, key);

            display_data[key] = {};

            for (var value_index = 0; value_index < values.length; ++value_index) {
                var key_value = values[value_index];
                var sub_table = rows_with_key_value(table_data, key, key_value);

                display_data[key][key_value] = generate_display_table_data(sub_table, other_keys);
            }
        }
    }
    return display_data;
}


// ["Temple Recommend Type","Unit","Age","Class Assignment","Gender"]

function display_data_to_html(display_data) {
    var main_keys = Object.keys(display_data).filter(function(e,i,a) {return e != "__count__";});
    var html = "<center><h2>Summary of Report</h2></center>\r\n<br/>";
    var total = display_data.__count__;

    main_keys.sort();
    for (var main_key_index = 0; main_key_index <main_keys.length; ++main_key_index) {
        var main_key = main_keys[main_key_index];
        var main_key_values = Object.keys(display_data[main_key]);

        main_key_values.sort();
        html += "<div style='display: inline-block;vertical-align: text-top'><table style='border: 1px solid black'><tr style='background-color:gray;color:white'><th colspan=2>" + main_key + "</th></tr>\r\n";
        for (var main_value_index = 0; main_value_index < main_key_values.length; ++main_value_index) {
            var main_value = main_key_values[main_value_index];
            var main_count = display_data[main_key][main_value].__count__;
            var inner_keys = Object.keys(display_data[main_key][main_value]).filter(function(e,i,a) {return e != "__count__";});

            inner_keys.sort();
            html += "<tr style='background-color:lightgray'><td colspan=2>";
            html += main_value;
            html += " - <b>" + main_count + "</b> (" + Math.round(100 * main_count / total) + ")%";
            html += "</td></tr>\r\n";

            for (var inner_key_index = 0; inner_key_index < inner_keys.length; ++inner_key_index) {
                var inner_key = inner_keys[inner_key_index];
                var inner_key_values = Object.keys(display_data[main_key][main_value][inner_key]);

                inner_key_values.sort();
                html += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b>" + inner_key + "</b></td></tr>\r\n";

                for (var inner_value_index = 0; inner_value_index < inner_key_values.length; ++inner_value_index) {
                    var inner_value = inner_key_values[inner_value_index];
                    var inner_count = display_data[main_key][main_value][inner_key][inner_value].__count__;

                    html += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td colspan>";
                    html += inner_value;
                    html += " - " + inner_count + " (" + Math.round(100 * inner_count / main_count) + ")%";
                    html += "</td></tr>\r\n";
                }
            }
            //html += "<tr style='background-color:black'><td colapsn=2>&nbsp;</td></tr>\r\n";
        }
        html += "</table></div>\r\n";
    }
    return html;
}

function display_table() {
    'use strict';
    var start = performance.now()
    var table_data = get_table_data();
    var content_area = document.getElementById("content");
    var info_area = document.createElement("div");
    var old_div = document.getElementById("summary_information");
    var groupings = get_data_grouping_keys(table_data); // ["Unit", "Temple Recommend Type"];
    var display_data = generate_display_table_data(table_data, groupings);
    var html_data = display_data_to_html(display_data);

    info_area.setAttribute("id", "summary_information");

    info_area.innerHTML = html_data;
    //info_area.innerText = JSON.stringify(display_data);
    console.log("time = " + (performance.now() - start));
    //content_area.insertBefore(info_area, content_area.childNodes[0]);
    content_area.append(info_area, content_area.childNodes[0]);
    if (old_div) {
        old_div.remove();
    }
}

(function() {
    'use strict';
    setTimeout(function(){display_table();}, 5000);
})();
