var employee = function(name, company, value){
    this.name = name;
    this.company = company;
    this.value = value;
    this.fantasyFunction = function(){
        return this.name;
    }    
}

employee.prototype.fantasyFunction2 = function(){
    return this.company;
}

var emp1 = new employee("Vigneash", "Oracle", 12)
var emp2 = new employee("Sundar", "Microsoft", 13)
console.log(emp1.fantasyFunction())
console.log(emp1.fantasyFunction2())