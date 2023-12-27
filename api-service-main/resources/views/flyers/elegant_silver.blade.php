<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://db.onlinewebfonts.com/c/20b8e550dbac9d31e068a148a2393128?family=MinionPro-Regular" rel="stylesheet" type="text/css"/>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>elegant_silver.pdf</title>
    <style>
    @page {
        margin: 0 25px;
    }    
    body {
        margin: auto;
        font-family: 'Playfair Display', serif;
    }

    hr {
        width: 90px;
        background-color: #000000;
        color: #000000;
        height: 2px;
        border-width: 0px;
    }

    .gold {
        background-image: url("{{ config('uplist.flyer_assets_url') . '/Elegant_silver_back.png' }}");
        background-repeat: no-repeat;
        background-size: cover;
        padding: 50px;
        padding-bottom: 10px;
        height: 910px;
        margin-top: -20px;
    }

    .primary-heading {
        font-size: 52px;
        text-align: center;
        line-height: 37px;
        font-weight: 400;
        margin-top: -50px;
        margin-bottom: 25px;
    }

    .profile-details {
        width: 350px;
        font-size: 13px;
        font-weight: 400;
    }

    .lo-detail {
        margin-bottom: -18px;
    }

    .profile_image {
        max-width: 110px;
        max-height: 95px;
        width: auto;
        height: auto;
    }

    .elegant-right-content {
        margin-top: -800px;
        margin-right: -360px;
    }

    .phone-img {
        width: 300px;
        height: 570px;
        position: absolute;
        top: 255px;
        right: 10%;
        z-index:0;
        margin-right:-50px;
    }

    .left-section {
        margin-top: 50px;
        width: 400px;
    }

    .hr-line {
        height: 80px;
        margin:auto;
        margin-top:auto;
        margin-top:30px;
    }

    .hr-line>div {
        margin-top: 58px;
    }

    .hr-left {
        width: 100%;
        height: 5px;
    }

    .hr-color {
        background-color: black;
    }

    .hr-right {
        width: 65%;
        height: 5px;
    }

    .header-logo {
        max-width: 270px;
        max-height: 80px;
        width: auto;
        height: auto;
        position:absolute;
        top:50%;
        left:50%;
        transform: translate(-50%, -50%);
        padding-left: 10;
        padding-right: 10px;
        background-color: #fff;
    }

    .company_logo {
        max-width: 125px;
        max-height: 45px;
        width: auto;
        height: auto;
        position:absolute;
        top:50%;
        left:50%;
        transform: translate(-50%, -50%);
    }

    .payment-alignment {
        font-size: 6px;
        position: absolute;
    }

    .property {
        position: absolute;
        top: 352px;
        right: 173px;
        z-index: 5;
        background-color: #ffffff;
        padding-bottom: 10px;
    }

    .property-value {
        font-size: 8px;
        width:120px;
        text-align:left;
        margin-bottom: -10px;
    }

    .sml-images {
        position: absolute;
        bottom: 35px;
        right: 210px;
        text-align: center;
    }

    .power-by {
        font-size: 7px;
        font-weight: 400;
        margin-bottom: 2px;
    }
    </style>
</head>

<body>
    <div style="height:120px;position: absolute;top:0;left:100px;">
        <img class="header-logo" src="{{ $company['logo'] }}" alt="" />
    </div>
    <div class="hr-line">
        <div class="hr-left hr-color" style="background-color:{{ $color }};"></div>
    </div>
    <div class="elegant-container gold" style="text-align: center; height: 878px;">
        <div class="left-section">
            <div class="elegant-left-content">
                <h1 class="primary-heading change-color">
                    YOUR RATES AND PAYMENTS ARE <span style="color:#ffffff;">ONE <br>CLICK AWAY.</span>
                </h1>
                    <div style="margin-left: auto;margin-right: auto; width: 162px;">
                    <img class="qr_code_img" style="width: 170px;" src="{{$qr_image}}" alt=""  style="border:1px solid #ffffff; padding:2px;"/>
                </div>
                <p style="font-size: 12px;margin-bottom: -5px;">READY TO SAVE? <span style="color:#ffffff;"> SCAN CODE FOR LIVE RATES.</span></p>
                <p style="font-size: 18px">NO PERSONAL INFORMATION REQUIRED.</p>
                <div style="position: absolute; top:490; left:115; width:150; height: 120px; margin-top: 35px;">
                    <img class="profile_image"  width="" src="{{ $loan_officer['profile_picture'] }}" alt="" style="border:2px solid #FFFFFF;" />
                </div>
                <div class="profile_image-container" style="position: absolute; top:590; left:51;">
                    <div class="profile-details" style="margin-left:10px; ">
                        <p class="lo-detail"> {{ $loan_officer['name'] }}</p>
                        <p class="lo-detail"> {{ $loan_officer['job_title'] }}</p>
                        <p class="lo-detail"> {{ $loan_officer['email'] }}</p>
                        <p class="lo-detail">{{ $loan_officer['mobile_number'] }}</p>
                        <p class="lo-detail"> NMLS# {{ $loan_officer['nmls_number'] }}</p>
                    </div>
                </div>   
                <div class="disclaimer-text-container" style="position:absolute; bottom: 25px; left: 30px;">
                    <p class="disclaimer-text disclosure-text" style="width:450px; font-size:10px;font-family: 'MinionPro-Regular'; line-height:10px !important;">{!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif</p>
                </div>
            </div>
        </div>
            @php
            $fontSize = '8.5px';

            $addressApt = implode([
                    $property['address'],
                    ...($property['apt_suite'] ? [
                        ', ', $property['apt_suite'] 
                    ] : [])
                ]);

            $address = match($source) {
                'listing' => implode([
                    $property['address'],
                    ', ',
                    ...($property['apt_suite'] ? [
                        $property['apt_suite'], ', ',
                    ] : []),
                    $property['city'],
                    ', ',
                    $property['state_abbreviation'],
                    ' ',
                    $property['zip'],
                ]),
                default => implode([
                    $property['address'],
                ]),
            };
            if($company['housing'] == 'equal_housing_lender'){
                $housing = 'house_lender_black.png';
            }else{
                $housing = 'house_opportunity_black.png';
            }

            if (Str::length($addressApt) > 37) {
                $fontSize = '5px';
            }

            if (Str::length($addressApt) > 34) {
                $fontSize = '6px';
            }
            
            @endphp
        <div class="elegant-right-content">
            <div style="height: 60px;position: absolute; top:300px; left:490px; z-index:5;">
                <img class="company_logo" src="{{ $company['logo'] }}" alt="">
            </div>
            <div class="property">
                <p class="property-value" style="white-space: nowrap !important; font-size:{{$fontSize}} !important;">{{ $addressApt }}</p>
                <p class="property-value" style="white-space: nowrap !important; font-size:{{$fontSize}} !important; margin-top:10px;">{{ $property['city'] }}, {{ $property['state_abbreviation'] }} {{ $property['zip'] }}</p>
                <p class="property-value" >PRICE: {{$property_value}}</p>
                <p class="property-value" >MILITART/VETERAN: NO</p>
                <p class="property-value" >FIRST TIME HOME BUYER: NO</p>
                <p class="payment-alignment" style="left: -5px; top: 135px;" >{{ $loan_amount }}</p>
                <p class="payment-alignment" style="left: 158px; top: 135px;" >{{ $default_down_payment }}</p>
                <p class="payment-alignment" style="left: -5px; top: 163.5px; width: 100%; text-align: left" >760 or higher (Excellent)</p>
                <p class="payment-alignment" style="left: 118px; top: 163.5px; width: 100%; text-align: left" >Primary Residence</p>
            </div>
            <img class="phone-img" src="{{ config('uplist.flyer_assets_url') . '/phone-silver-new.png' }}" alt=""/>
            <div class="sml-images">
                <p class="power-by">POWERED BY</p>
                <img src="{{ config('uplist.flyer_assets_url') . '/uplist-logo-black.png' }}" alt="" width="47"/><br>
                <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" width="35"  style="margin-top: 10px;"/>
            </div>
        </div>
    </div>
</body>

</html>