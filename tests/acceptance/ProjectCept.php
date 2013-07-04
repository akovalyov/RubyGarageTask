<?php
$I = new WebGuy($scenario);
$I->wantTo('create a project');
$I->amGoingTo("click 'Add project' button");
$I->amOnPage("/");
$I->click("Add TODO list");
$I->wait("500");
$I->see("Project name");
$I->fillField("name", "acceptance project");
$I->click("Save");
$I->wait("500");
$I->see("Project was successfully created");
$I->see("acceptance project");
$I->dontSee('Project name');