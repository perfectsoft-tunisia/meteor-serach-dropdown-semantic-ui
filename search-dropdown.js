import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';
import {Mongo} from 'meteor/mongo';


Template.SearchDropdown.onCreated(function () {
    this.ResultsCollection = new Mongo.Collection(null);
    this.textSearchCollection = new Mongo.Collection(null);    
});

Template.SearchDropdown.helpers({
    options() {
        return _.pick(this.dropdown, 'id', 'icon');       
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
            template.currentOption = {label: text, value: val};
            template.data.onChange(val, text, $elem, template.data.id);
        }
        dropdownOptions.onChange = onChange;
    } else {
        dropdownOptions.onChange = function (val, text) {
            template.currentOption = {label: text, value: val};
        };
    }

    if (this.data.placeholder) {
        dropdownOptions.placeholder = this.data.placeholder;
    }
    if (this.data.currentOption) {
        this.currentOption = this.data.currentOption;
        this.ResultsCollection.insert({
            name: this.data.currentOption.label,
            value: this.data.currentOption.value,
            _id: this.data.currentOption.value,
        })
    } else {
        this.currentOption = {};
    }

    $dropdown.dropdown(dropdownOptions);

    const inputEvent = $dropdown.dropdown('get inputEvent');
    const $search = $dropdown.find('.search');

    this.autorun(() => { 
        $dropdown.dropdown('change values', this.ResultsCollection.find({}).fetch());
        $search.trigger(inputEvent)
    });

    if (this.data.currentOption) {
        this.currentOption = this.data.currentOption;
        $dropdown.dropdown('set selected', this.currentOption.value);
    } else {
        this.currentOption = {};
    }
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