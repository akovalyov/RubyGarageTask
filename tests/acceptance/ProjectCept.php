<?php
$I = new WebGuy($scenario);
//project creation
$I->wantTo('manage a project');
$I->amGoingTo("create a project");
$I->amOnPage("/");
$I->click("Add TODO list");
$I->wait("500");
$I->see("Save");
$I->fillField("name", "acceptance project");
$I->click("Save");
$I->wait("500");
$I->see("Project was successfully created");
$I->see("acceptance project");
$I->dontSee('Project name');
//let's edit the project
$I->amGoingTo('edit just created project');
$I->click('.todo:last-child .project_edit');
$I->see('Save', '.todo:last-child');
$I->fillField("name", "acceptance project edited");
$I->click("Save");
$I->wait("500");
$I->see("Project was successfully updated");

