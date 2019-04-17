var globalVar = 10;

(function outerFunction(outerArgs){
    var outerFunctionArg = 'x';
    (
        function innerFunction(innerArgs){
            var innerFunctionArgs = 'y';
            console.log(innerFunctionArgs);
            console.log(innerArgs);
            console.log(outerFunctionArg);
            console.log(outerArgs);
            console.log(globalVar);
        }
    )(56)
})(100)

/*
    The inner Most function can handle or has variables visible with defined with global, parent scope. This 
    is function closure
*/