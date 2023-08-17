const express = require('express');
var router = express.Router();
const Project = require('../models/project');
// const Comment = require('../models/comment');
const middleware = require('../middleware/index1');
const User = require("../models/user");
const { isNull } = require('url/util');
const Supervisor = require('../models/supervisor');
// const supervisorss= ["Aman Shakya",
// "Anand Kumar Shah",
// "Anil Verma",
// "Anila Kansakar",
// "Bibha Staphit",
// "Jyoti Tandukar",
// "Daya Sagar Baral"];

router.get('/', async function (req, res) {
  // const user = await User.find();
  // console.log(req.isAuthenticated())
  // console.log('helloworldkaldsjalkdf')
  const supervisors = await Supervisor.find();
  console.log("fsdfsa ",supervisors)
  Project.find().populate('supervisor').then(allProjects=>  {
    console.log(allProjects);
      res.render('projects/index', {
            projects: allProjects,
            currentUser:  req.user,
            supervisors: supervisors
         })
        }
  ).catch(err=>console.log(err))
})

router.get('/new', middleware.isLoggedIn, async function (req, res) {
  const supervisors = await Supervisor.find();
  res.render('projects/new',
  {supervisors})
})


//Add Supervisor
router.get('/add-supervisor', async (req, res) => {
  try {
    const supervisors = await Supervisor.find({}, 'name'); // Fetch only the name field
    res.render('admin/add-supervisor', { supervisors });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




//Add project
router.post('/', middleware.isLoggedIn, function (req, res) {
  var title = req.body.title
  var year = req.body.year
  var description = req.body.description
  var link = req.body.link
  var image = req.body.image
  var supervisor = req.body.supervisor
  // var authors = req.body.authors
  var namearray = [];
  var pending = req.body.member.length;
  req.body.member.forEach(Username => {
    User.findOne({ username: Username }, function (err, foundUser) {
      if (err || !foundUser) {
        // console.log("cant find user with username/rollno:", Username)
        pending--;
      } else {
        namearray.push(foundUser.user);
        // console.log("added user to project contributor: ", foundUser.user)
        // console.log("\n User object: ", foundUser)
        pending--;
      }
      if (pending == 0) {
        // console.log("array of name", namearray)
        var author = {
          id: req.user._id,
          username: req.body.member,
          user: namearray
        }
        // console.log("the pushed data ", author)
        var reviewStatus = false
        var abstract = req.body.abstract

        var newProject = { title: title, image: image, description: description, author: author, year: year, link: link, supervisor: supervisor, reviewStatus: reviewStatus, abstract: abstract }

        Project.create(newProject, function (err, newProj) {
          if (err) {
            // console.log("error", err);
          }
          else {
            res.redirect('/projects')
          }
        })
      }
    })
  });


})


//my project
router.get('/myprojects/:id', middleware.isLoggedIn, (req, res) => {
  try {
    console.log('helloworld')
    Project.find({ "author.username": req.params.id }, function (err, allProjects) {
      if (err) {
        console.log(err);
      }
      else {
        res.render('projects/index', { projects: allProjects })
      }
    })

  } catch (error) {
    console.log(error);
  }
});












//search
// router.get('/search', (req, res) => {
//   try {
//     Project.find({ $or: [
//      { title: { '$regex': new RegExp(req.query.dsearch, "i") } },
//      { supervisor: { '$regex': new RegExp(req.query.dsearch, "i") } },
//      {"author.user" : {'$regex': new RegExp(req.query.dsearch,"i")}},
//      {year: { '$regex': new RegExp(req.query.dsearch, "i")}}
//     ] }, (err, data) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.render('projects/index', { projects: data });
//       }
//     })
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.get('/:id', function (req, res) {
//   Project.findById(req.params.id).populate('comments').exec(function (err, foundGround) {
//     if (err) {
//       console.log("ERRORORORORO:", err);
//     }
//     else {
//       res.render('projects/show', { project: foundGround })
//     }
//   })
// })

router.get('/search', async (req, res) => {
  console.log(req.query);
  try {
    const searchQuery = req.query.dsearch || '';
    const yearFilter = req.query.yearFilter || '';
    const supervisorFilter = req.query.supervisorFilter || '';

    const query = {
      $or: [
        { title: { '$regex': new RegExp(searchQuery, 'i') } },
        // { "supervisor.name": { '$regex': new RegExp(searchQuery, 'i') } },
        // { 'author.user': { '$regex': new RegExp(searchQuery, 'i') } },
        // { year: { '$regex': new RegExp(searchQuery, 'i') } }
      ]
    };

    if (yearFilter) {
      query.year = { '$regex': new RegExp(yearFilter, 'i') };
    }

    if (supervisorFilter) {
      // query['supervisor.name'] = { '$regex': new RegExp(supervisorFilter, 'i') };
      query.supervisor = supervisorFilter;
    }
    console.log(query)
    const projects = await Project.find(query).populate('supervisor');
    const supervisors= await Supervisor.find();
    console.log(projects)
    res.render('projects/index', {
       projects,
       supervisors,    
      currentUser:  req.user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', function (req, res) {
  Project.findById(req.params.id).populate('comments').populate('supervisor').exec(function (err, foundProject) {
    if (err) {
      console.log("Error:", err);
    } else {
      console.log(foundProject)
      res.render('projects/show', { project: foundProject });
    }
  });
});










// edit route
router.get('/:id/edit', middleware.checkProjectOwnership, function (req, res) {
  Project.findById(req.params.id)
  .populate('supervisor')
  .then(async foundProject=>{
    // console.log(`'${foundProject.supervisor}'  ==  '${supervisors[0]}'`)
    // console.log("hello ",foundProject.supervisor == supervisors[0])
    const supervisors = await Supervisor.find();
    const currentSupervisor= foundProject.supervisor._id;
    console.log("supervisors: ", supervisors);
    res.render("projects/edit", {
      project: foundProject,
      currentSupervisor,
      supervisors: supervisors
     })
    })
    .catch(err => console.log(err))
})

// Update Route
router.put("/:id", middleware.checkProjectOwnership, function (req, res) {
  console.log("\n")
  console.log("data to update: ", req.body);
  var namearray=[];
  pending = req.body.project.author[0].username.length
  req.body.project.author[0].username.forEach(Username => {
    User.findOne({ username: Username }, function (err, foundUser) {
      if (err || !foundUser) {
        // console.log("cant find user with username/rollno:", Username)
        pending--;
      } else {
        namearray.push(foundUser.user);
        // console.log("added user to project contributor: ", foundUser.user)
        // console.log("\n User object: ", foundUser)
        pending--;
      }
      if (pending == 0) {
        req.body.project.author[0].user = namearray;
        console.log("Updated author data:", req.body.project.author);
        Project.findByIdAndUpdate(req.params.id, req.body.project, function (err, updatedproject) {
          if (err) {
            res.redirect('/projects')
          }
          else {
            console.log("updated ",updatedproject)
            res.redirect('/projects/' + req.params.id)
          }
        })
      }
    })
  })
  


})


// DESTROY PROJECT ROUTE
router.delete('/:id', middleware.checkProjectOwnership, function (req, res) {
  Project.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      res.redirect('/projects/' + req.params.id)
    }
    console.log("deleted")
    res.redirect('/projects')
  })
})




module.exports = router