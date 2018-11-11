import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';

export class SearchDropdown {
    constructor(options) {
        const instance = this;

        for (let key in options) {
            this[key] = options[key];
        }
        
        const methodName = 'SearchDropdown_' + instance.id;

        Meteor.methods({
            [methodName](searchText) {
                
                let user;

                if (instance.needUser) {
                    user = Meteor.user();
                }

                instance.allow(this.userId, user);

                if (typeof instance.collection == 'string') {
                    //TODO
                }

                selector = instance.selector(this.userId, user);

                let searchValue = '';
                if (instance.regExp) {
                    //TODO: sanitize regexp
                    if (instance.regExp === true) {
                        searchValue = new RegExp(searchText);
                    } else {
                        searchValue = new RegExp(searchText, instance.regExp.flags);
                    }
                } else {
                    searchValue = searchText;
                }

                searchKey = instance.searchKey;

                selector[searchKey] = searchValue;

                return instance.collection.find(selector, {fileds: instance.fields}).fetch();
            }
        });

        if (Meteor.isClient) {
            Template.registerHelper(methodName, function () {
                return _.pick(options, 'id', 'transform', 'valueKey', 'labelKey', 'icon');
            })
        }
    }
}