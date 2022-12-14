function Validator(options) {
    const formElement = document.querySelector(options.form);
    let errorMessage = "";
    let selectorRules = {};
    let isFormValid = true;

    // Get parent for input and message element
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Validation value user Enter from input
    function validate(rules, inputElement) {
        const parent = getParent(inputElement, options.parentSelector);
        const messageElement = parent.querySelector(options.messageSelector);
        for (let i in rules) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        formElement.querySelector(
                            `input[name="${inputElement.name}"]:checked`
                        )
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value.trim());
            }

            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            messageElement.innerText = errorMessage;
            parent.classList.add(options.invalidClass);
        } else {
            messageElement.innerText = "";
            parent.classList.remove(options.invalidClass);
        }

        return !errorMessage;
    }

    // get the function test for rule
    function getRules(selectorRules, rule) {
        if (Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
        } else {
            selectorRules[rule.selector] = [rule.test];
        }

        return selectorRules[rule.selector];
    }

    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            options.rules.forEach((rule) => {
                const inputElement = formElement.querySelector(rule.selector);
                let rules = getRules(selectorRules, rule);
                let isValid = validate(rules, inputElement);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === "function") {
                    const enableInputs = formElement.querySelectorAll("[name]");

                    console.log(enableInputs);

                    let formData = Array.from(enableInputs).reduce(
                        (values, input) => {
                            switch (input.type) {
                                case "radio":
                                    values[input.name] =
                                        formElement.querySelector(
                                            `input[name="${input.name}"]:checked`
                                        ).value;
                                    break;
                                case "checkbox":
                                    // if all checkboxes are not checked
                                    if (!input.matches(":checked"))
                                        return values;

                                    // if value[input.name] is not an array
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = []; // convert to array
                                    }

                                    values[input.name].push(input.value);
                                    break;
                                case "file":
                                    values[input.name] = input.files;
                                    break;
                                default:
                                    values[input.name] = input.value.trim();
                                    break;
                            }
                            return values;
                        },
                        {}
                    );

                    console.log(formData);
                    options.onSubmit(formData);
                }
            }
        };

        //L???p qua rules v?? x??? l??
        options.rules.forEach((rule) => {
            // const inputElement = formElement.querySelector(rule.selector);
            let rules = getRules(selectorRules, rule);

            const inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach((inputElement) => {
                if (inputElement) {
                    inputElement.onblur = () => {
                        validate(rules, inputElement);
                    };

                    inputElement.oninput = () => {
                        validate(rules, inputElement);
                    };
                }
            });
        });
    }
}

Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : "Kh??ng ???????c ????? tr???ng tr?????ng n??y";
        },
    };
};
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value.trim())
                ? undefined
                : "Vui nh???p ????ng email!";
        },
    };
};

Validator.checkValueLength = function (selector, min, max, message) {
    return {
        selector: selector,
        test: function (value) {
            if (value.length < min) {
                return message || `Gi?? tr??? ph???i c?? ??t nh???t ${min} k?? t???`;
            } else if (value.length > max) {
                return message || `Gi?? tr??? kh??ng ???????c v?????t qu?? ${max} k?? t???`;
            } else {
                return undefined;
            }
        },
    };
};

Validator.checkConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() === getConfirmValue().trim()
                ? undefined
                : message || "Gi?? tr??? nh???p v??o ch??a ch??nh x??c!";
        },
    };
};
