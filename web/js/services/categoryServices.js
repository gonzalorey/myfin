"use strict";

var CategoryServices = {
    getAllCategories: (type = undefined, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "cats/"
        $.ajax({
            async: true,
            type: "GET",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                type: undefined
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
    addCategory: (name, description, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "cats/"

        $.ajax({
            async: true,
            type: "POST",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                name,
                description
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
    removeCategory: (catID, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "cats/"

        $.ajax({
            async: true,
            type: "DELETE",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                category_id: catID,
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
    editCategory: (catID, newName, newDescription, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "cats/"

        $.ajax({
            async: true,
            type: "PUT",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                category_id: catID,
                new_name: newName,
                new_description: newDescription,
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    }
}

//# sourceURL=js/actions/categoryServices.js