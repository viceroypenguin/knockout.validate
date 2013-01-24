knockout.validate
=================

Knockout.Validate provides a basic framework for adding validation to a Knockout ViewModel.  

Usage
=====

Reference knockout.validate.js in your html file.  For a basic validation, you can use the following:
```
data-bind="validate: function() { return <truthy_value>; }"
```
Knockout.validate looks for exactly false (x === false) and fails the validation if the return is false.  Anything else is a pass, whether true or undefined.  Upon finding a false value, it adds the css class "error" to the input box [this will become more configurable later].  

Upon referencing any validation function, knockout.validate adds an isValid() observable to the current viewModel.  This is great for attaching to buttons:
```
data-bind="enable: isValid()"
```

Two additional validation bindings have also been provided: required and requiredID.  required ensures that a value is non-null and not an empty string.  requiredID ensures that a value is non-null and not equal to 0.  required is great for an input textbox and requiredID is great for a select list to ensure that an ID is selected.

Caveats
=======

Currently, knockout.validate requires jQuery to have been referenced before using.  This may change at a later date.

License
=======

Copyright (c) 2013, Stuart Turner; knockout.validate is licensed under the Apache 2.0 License


