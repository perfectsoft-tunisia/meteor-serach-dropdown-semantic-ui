import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';
import {Mongo} from 'meteor/mongo';


Template.SearchDropdown.onCreated(function () {
    this.ResultsCollection = new Mongo.Collection(null);
    this.textSearchCollection = new Mongo.Collection(null);
    this.ResultsCollection.insert({
        name: this.data.currentOptionLabel,
        value: 'all',
        _id: 'all',
        selected: true
    })
});

Template.SearchDropdown.helpers({
    options() {
        let options =  _.pick(this.dropdown, 'id', 'icon');
        options.currentOptionLabel = this.currentOptionLabel;

        return options;        
    },
    results() {
        return Template.instance().ResultsCollection.find();
    }
});

Template.SearchDropdown.onRendered(function () {    
    
    let dropdownOptions = {
        fullTextSearch: true,
        ignoreCase: true,
        match: 'text'
    };

    const $dropdown = this.$('.dropdown');
    let template = this;
    if (this.data.onChange) {
        const onChange = function (val, text, $elem) {
            template.data.onChange(val, text, $elem, template.data.id);
        }
        dropdownOptions.onChange = onChange;
    }

    $dropdown.dropdown(dropdownOptions);

    const inputEvent = $dropdown.dropdown('get inputEvent');
    const $search = $dropdown.find('.search');

    this.autorun(() => { 
        $dropdown.dropdown('change values', this.ResultsCollection.find({}).fetch());
        $search.trigger(inputEvent)
    });
});

Template.SearchDropdown.events({
    'keyup input.search': _.debounce(function (event, template) {
        event.preventDefault();
        const query = $(event.currentTarget).val();
        const dropdownOptions = template.data.dropdown;
        const methodName = 'SearchDropdown_' + dropdownOptions.id;
        const labelKey = dropdownOptions.labelKey;
        const valueKey = dropdownOptions.valueKey;

        let wasSearchedQuery = template.textSearchCollection.findOne({text: query});
        if (wasSearchedQuery) {
            return
        } else {
            $(event.currentTarget).closest('.dropdown').addClass('loading');
            template.textSearchCollection.insert({text: query});
            Meteor.call(methodName, query, (error, result) => {
                if (error) {
                    console.error(error);
                } else {    
                    $(event.currentTarget).closest('.dropdown').removeClass('loading');
                    result.forEach((data) => {
                        template.ResultsCollection.upsert(data[valueKey], {$set: {
                            name: data[labelKey],
                            value: data[valueKey]
                        }});
                    });
                }
            });
        }        
    },300),
});