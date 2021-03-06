"use strict";

angular.module("jtt_aping_flickr")
    .service('apingFlickrHelper', ['apingModels', 'apingTimeHelper', 'apingUtilityHelper', function (apingModels, apingTimeHelper, apingUtilityHelper) {
        this.getThisPlatformString = function () {
            return "flickr";
        };

        this.getThisPlatformLink = function () {
            return "http://flickr.com/";
        };

        this.getUserNameFromString = function (_string) {
            var userName = _string.replace("nobody@flickr.com (", "");
            userName = userName.substr(0, userName.length - 1);
            return userName;
        };

        this.removeOverHeadFromDescription = function (_string) {
            if (angular.isDefined(_string)) {
                if (typeof _string === "string") {
                    var parts = _string.split("posted a photo:");
                    if (parts.length > 1) {
                        _string = parts[1].trim();
                    }
                    if (_string === "") {
                        _string = undefined;
                    }
                }
            }
            return _string;
        };

        this.getObjectByJsonData = function (_data, _helperObject) {
            var requestResults = [];
            if (_data) {
                var _this = this;

                if (_data.data && _data.data.items) {

                    angular.forEach(_data.data.items, function (value, key) {
                        if (angular.isUndefined(_helperObject.items) || (_helperObject.items > 0 && requestResults.length < _helperObject.items)) {
                            var tempResult = _this.getItemByJsonData(value, _helperObject);
                            if (tempResult) {
                                requestResults.push(tempResult);
                            }
                        }
                    });
                }
            }
            return requestResults;
        };

        this.getItemByJsonData = function (_item, _helperObject) {
            var returnObject = {};
            if (_item && _helperObject.model) {

                if (_helperObject.getNativeData === true || _helperObject.getNativeData === "true") {
                    returnObject = this.getNativeItemByJsonData(_item);
                } else {
                    switch (_helperObject.model) {
                        case "social":
                            returnObject = this.getSocialItemByJsonData(_item);
                            break;
                        case "image":
                            returnObject = this.getImageItemByJsonData(_item);
                            break;

                        default:
                            return false;
                    }
                }
            }
            return returnObject;
        };

        this.getSocialItemByJsonData = function (_item) {
            var socialObject = apingModels.getNew("social", this.getThisPlatformString());

            //fill _item in socialObject
            angular.extend(socialObject, {
                blog_name: _item.author ? this.getUserNameFromString(_item.author) : undefined,
                blog_id: _item.author_id || undefined,
                blog_link: _item.author_id ? this.getThisPlatformLink() + _item.author_id : undefined,
                timestamp: apingTimeHelper.getTimestampFromDateString(_item.published, 1000, 3600 * 1000),
                post_url: _item.link,
                intern_id: (_item.link).split("flickr.com").length >= 2 ? (_item.link).split("flickr.com")[1] : undefined,
                thumb_url: _item.media ? _item.media.m : undefined,
                img_url: _item.media ? (_item.media.m).replace("_m.", ".") : undefined,
            });

            socialObject.native_url = socialObject.img_url;

            socialObject.text = _item.description ? this.removeOverHeadFromDescription(apingUtilityHelper.getTextFromHtml(_item.description)) : undefined;

            if (_item.title) {
                if (socialObject.text) {
                    socialObject.caption = _item.title;
                } else {
                    socialObject.text = _item.title;
                }
            }

            socialObject.date_time = new Date(socialObject.timestamp);

            if ((_item.description).indexOf("posted a photo") > -1) {
                socialObject.type = "image";
            } else {
                return false;
            }

            return socialObject;
        };

        this.getImageItemByJsonData = function (_item) {
            var imageObject = apingModels.getNew("image", this.getThisPlatformString());

            //fill _item in imageObject
            angular.extend(imageObject, {
                blog_name: _item.author ? this.getUserNameFromString(_item.author) : undefined,
                blog_id: _item.author_id || undefined,
                blog_link: _item.author_id ? this.getThisPlatformLink() + _item.author_id : undefined,
                timestamp: apingTimeHelper.getTimestampFromDateString(_item.published, 1000, 3600 * 1000),
                post_url: _item.link,
                intern_id: (_item.link).split("flickr.com").length >= 2 ? (_item.link).split("flickr.com")[1] : undefined,
                thumb_url: _item.media ? _item.media.m : undefined,
                img_url: _item.media ? (_item.media.m).replace("_m.", ".") : undefined,
            });

            imageObject.native_url = imageObject.img_url;
            imageObject.text = _item.description ? this.removeOverHeadFromDescription(apingUtilityHelper.getTextFromHtml(_item.description)) : undefined;

            if (_item.title && _item.title.toLowerCase() !== "untitled") {
                if (imageObject.text) {
                    imageObject.caption = _item.title;
                } else {
                    imageObject.text = _item.title;
                }
            }

            imageObject.date_time = new Date(imageObject.timestamp);

            if ((_item.description).indexOf("posted a photo") <= 0) {
                return false;
            }

            return imageObject;
        };

        this.getNativeItemByJsonData = function (_item) {
            if ((_item.description).indexOf("posted a photo") <= 0) {
                return false;
            }
            return _item;
        };
    }]);