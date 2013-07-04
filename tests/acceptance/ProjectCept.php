<?php
$I = new WebGuy($scenario);
$I->wantTo('create a project');
$I->amGoingTo("click 'Add project' button");
$I->amOnPage("/");