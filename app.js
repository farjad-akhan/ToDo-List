const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-farjad:87654322@cluster0.dkfsg.mongodb.net/todolistDB");

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

const item1=new Item({
  name:"Welcome to your todo list."
});
const item2=new Item({
  name:"Hit + to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete this item."
});

const defaultItems=[item1,item2,item3];

app.get("/",function(req,res){
  //
  // var today =new Date();
  // var options={
  //   weekday:"long",
  //   day:"numeric",
  //   month:"long"
  // }
  // var day =today.toLocaleDateString("en-us",options)

    Item.find({},function(err,foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }else {
            console.log("Successfully saved default items to DB.");
          }
        });
        res.redirect("/");
      }else {
            res.render("list",{listTitle:"Today",newListItems:foundItems});
          }
    });

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items :defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });


});

app.post("/",function(req,res){
  const itemName= req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully removed");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.listen(3000,function(){
  console.log("server up and running");
});
