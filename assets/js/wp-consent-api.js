/**
 * to retrieve consent directly
 */

function wp_has_consent(category){
    var consent_type = window.wp_consent_type;
    var has_consent_level = false;
    var cookie_value = consent_api_get_cookie(category);

    if (!consent_type) {
        //if consent_type is not set, there's no consent management, we should return true to activate all cookies
        has_consent_level = true;

    } else if (consent_type.indexOf('optout')!==-1 && cookie_value === '') {
        //if it's opt out and no cookie is set we should also return true
        has_consent_level = true;

    } else {
        //all other situations, return only true if value is allow
        has_consent_level = (cookie_value ==='allow');
    }

    return has_consent_level;
}


function consent_api_setcookie(name, value) {
    var secure = ";secure";
    var days = consent_api.cookie_expiration;
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = ";expires=" + date.toGMTString();

    if (window.location.protocol !== "https:") secure = '';

    document.cookie = name + "=" + value + secure + expires + ";path=/";
}

function consent_api_get_cookie(cname) {
    var name = cname + "="; //Create the cookie name variable with cookie name concatenate with = sign
    var cArr = window.document.cookie.split(';'); //Create cookie array by split the cookie by ';'

    //Loop through the cookies and return the cooki value if it find the cookie name
    for (var i = 0; i < cArr.length; i++) {
        var c = cArr[i].trim();
        //If the name is the cookie string at position 0, we found the cookie and return the cookie value
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }

    //If we get to this point, that means the cookie wasn't found, we return an empty string.
    return "";
}

/**
 * Set a new consent category value
 * @param category
 * @param value
 */

function wp_set_consent(category, value){
    if (value!=='allow' && value!=='deny') return;

    consent_api_setcookie('wp_consent_'+category, value);
    var changedConsentCategory = [];
    changedConsentCategory[category] = value;
    //trigger a hook for plugins to hook into
    console.log("trigger hook");
    $.event.trigger({
        type: "wp_listen_for_consent_change",
        changedConsentCategory: changedConsentCategory
    });
}


jQuery(document).ready(function ($) {
    'use strict';
    /**
     * Set consent_type as passed by localize_script, and trigger a hook so geo ip scripts can alter it as needed.
     */
    window.wp_consent_type = consent_api.consent_type;
    $.event.trigger({
        type: "wp_set_consent_type",
        consent_type: window.wp_consent_type,
    });
});


document.addEventListener("my_event", function(e) {
    console.log(e.detail);
});

var detail = 'Event fired';

try {

    // For modern browsers except IE:
    var event = new CustomEvent('my_event', {detail:detail});

} catch(err) {

    // If IE 11 (or 10 or 9...?) do it this way:

    // Create the event.
    var event = document.createEvent('Event');
    // Define that the event name is 'build'.
    event.initEvent('my_event', true, true);
    event.detail = detail;

}

// Dispatch/Trigger/Fire the event
document.dispatchEvent(event);