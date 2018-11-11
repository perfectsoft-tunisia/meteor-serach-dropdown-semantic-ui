import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';


Template.SearchDropdown.onCreated(function () {
    this.listOfData = new ReactiveVar();
});

Template.SearchDropdown.helpers({
    options() {
        let options =  _.pick(this.dropdown, 'id', 'icon');
        options.currentOptionLabel = this.currentOptionLabel;

        return options;        
    },
    results() {
        return Template.instance().listOfData.get();
    }
});

Template.SearchDropdown.onRendered(function () {
    
    let dropdownOptions = {};
    const $dropdown = this.$('.dropdown');

    if (this.data.onChange) {
        const onChange = this.data.onChange;
        dropdownOptions.onChange = onChange;
    }

    $dropdown.dropdown(dropdownOptions); 
});

Template.SearchDropdown.events({
    'keyup .search': _.debounce(function (event, template) {
        event.preventDefault();
        query = $(event.currentTarget).val();
        const dropdownOptions = template.data.dropdown;
        const methodName = 'SearchDropdown_' + dropdownOptions.id;
        const labelKey = dropdownOptions.labelKey;
        const valueKey = dropdownOptions.valueKey;

        Meteor.call(methodName, {query}, (error, result) => {
            if (error) {
                console.error(error);
            } else {    
                const listOfData = result.map((data) => {
                    return {
                        label: data[labelKey],
                        value: data[valueKey]
                    };
                });
                
                listOfData.unshift({
                    label: template.data.currentOptionLabel,
                    value: 'all'
                });

                template.listOfData.set(listOfData);
            }
        });
        
    },300),
});



function a() {

}

function b() {

}

c = a(b())
