<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>company_theme.pdf</title>
    <style>
    @page {
        margin: 0 25px;
    }

    .triangle-up p {
        color: #000000;
    }

    .secondary-background-color {
        position: relative;
        border-left: 1100px solid transparent;
        border-right: 1100px solid transparent;
        /* border-bottom: 494px solid #7ccda3; */
        height: 130px;
        margin-left: -700px;
        margin-top: -130px;
    }


    .triangle-up .triangle-container .first-content {
        position: absolute;
        top: 235px;
        font-weight: 800;
        width: 600px;
        font-size: 12px;
        text-align: center;
        margin-left: -115px;
    }

    .triangle-up .triangle-container .second-content {
        position: absolute;
        top: 270px;
        width: 400px;
        font-weight: 800;
        width: 800px;
        margin-left: -210px;
        font-size: 18px;
    }

    .special-offer-text {
        position: absolute;
        width: 150px;
        font-size: 14px;
        padding: 30px;
        bottom: -290%;
        margin-left: -350px;
    }

    .special-offer-text p {
        line-height: 12px;
        padding-top: 18px;
        padding-bottom: 18px;
    }

    hr {
        width: 95px;
        background-color: #000000;
        color: #000000;
        height: 2px;
        border-width: 0px;
    }

    .secondary-section {
        margin-left: -180px;
    }

    .triangle-up img.qr_code_img {
        position: absolute;
        top: -500px;
        left: 0px;
        transform: translate(-50%, 280%);
        width: 190px;
    }

    .main-body {
        overflow: hidden;
        height: 925px;
        margin: auto;
        margin-top: 135px;
        font-family: "Roboto Slab", serif;
    }

    .body-color {
        text-align: center;
    }

    .image_container {
        text-align: center;
        background-color: #ffffff;
    }

    .company_logo img {
        max-width: 270px;
        max-height: 80px;
        width: auto;
        height: auto;
        position:absolute;
        top:50%;
        left:50%;
        transform: translate(-50%, -50%);
    }

    .qr_code img {
        display: inline-block;
    }

    .header-title {
        text-align: center;
        margin-top: 20px;
    }

    .header-title hr {
        display: inline-block;
        width: 12.5%;
        margin: 0 12px;
        margin-bottom: -22px;
        border: none;
        border-top: 1px black;
        vertical-align: middle;
    }

    .header-title h1 {
        display: inline;
        margin-left: auto;
        margin-right: auto;
        margin-top: -20px !important;
        font-weight: 900;
        text-align: center;
        font-size: 37px;
        max-width: 420px;
    }

    .second_header-title {
        margin-top: -10px;
    }

    .second_header-title h1 {
        font-size: 57px;
        text-align: center;
        font-weight: 900;
        line-height: 70%;
        color: #ffffff;
    }

    .third_header-title {
        margin-top: -45px;
    }

    .third_header-title h1 {
        font-weight: 900;
        text-align: center;
        padding-left: 100px;
        padding-right: 100px;
    }

    .right-content {
        max-width: 400px;
        position: absolute;
        bottom: -330px;
        left: 22px;
        width: 400px;
        line-height: 12px;
        font-weight: 800;
        text-align: center;
    }

    .right-content p:first-of-type{
        font-size: 16px;
    }

    .lo-detail {
        margin-bottom: -12px;
    }

    .primary-title {
        bottom: -200%;
    }

    .footer div {
        width: 540px;
        height: 100px;
        text-align: center;
    }

    .footer h3 {
        position: absolute;
        bottom: 0;
        font-size: 10px;
        font-weight: 500;
        line-height: 10px;
    }

    .powered-by-text {
        position: absolute;
        bottom: -500px;
        margin-left: -360px;
    }

    .powered-by-text p {
        font-size: 7px;
    }

    .change-color {
        color: #000000;
    }

    .profile_img {
        max-height: 160px;
        max-width: 140px;
        width: 130px;
        height: auto;
    }

    .disclaimer-text {
        width: 300px;
        position: absolute;
        right: -153px;
        top: 380px;
    }
    </style>
</head>

<body>
    <div class="image_container company_logo" style="height: 135px;width: 300px;position: absolute;left: 240px;">
        <img class="company-logo" src="{{ $company['logo'] }}" alt="" />
    </div>
    <div class="main-body body-color background-color-change change-color" style="background-color:{{ $color }};">
        <div class="header-title">
            <hr>
                <h1 class="line">GET YOUR</h1>
            <hr>
        </div>
        <div class="second_header-title">
            <h1>
                RATES &
                <br />
                PAYMENTS FOR
            </h1>
        </div>

        @php
        $marginBottom = '110px';
        $lineHeight = '38px';
        $fontSize = '37px';
        $disclosureMargin = '-95px';
        $fontSizeProfile = '14px';
        
        if (Str::length($property['address']) > 33) {
            $marginBottom = '100px';
            $lineHeight = '42px';
            $fontSize = '33px';
        }
        
        if($company['housing'] == 'equal_housing_lender'){
            $housing = 'house_lender_black.png';
        }else{
            $housing = 'house_opportunity_black.png';
        }
        
        if(Str::length($disclosure) > 200){
            $disclosureMargin = '-110px';
        }
  
        if (Str::length($loan_officer['email']) > 36) {
            $fontSizeProfile = '12px';
        }
        
        @endphp

        <div class="third_header-title header-address" style="margin-bottom: {{ $marginBottom }}">
            <h1 class="change-color" style="font-size: {{ $fontSize }}; white-space: nowrap !important; line-height: {{ $lineHeight }}"> {{$property['address']}} </h1>
        </div>

        <div class="triangle-up secondary-background-color"
            style="border-bottom: 520px solid rgba(255,255,255,0.37); z-index:0;">
            <div class="qr_code">
                <img style="z-index:99;" class="qr_code_img"
                    src="{{$qr_image}}" alt="" />
            </div>
            <div class="triangle-container" style="padding-top: 30px;">
               
                <div class="secondary-section">
                    <p class="first-content">READY TO SAVE? SCAN CODE FOR LIVE RATES.</p>

                    <p class="second-content">NO PERSONAL INFORMATION REQUIRED.</p>
                    
                </div>
                <div class="third-section" style="font-weight:700;">
                    <div class="special-offer-text">
                        <hr />
                        <p style="font-weight: 800;">This SPECIAL OFFER brought to you by</p>
                        <hr />
                    </div>

                    <div class="right-content" style="font-size:{{ $fontSizeProfile }};">
                        <p class="lo-detail"> {{ $loan_officer['name'] }}</p>
                        <p class="lo-detail"> {{ $loan_officer['job_title'] }}</p>
                        <p class="lo-detail"> {{ $loan_officer['email'] }}</p>
                        <p class="lo-detail"> {{ $loan_officer['mobile_number'] }}</p>
                        <p class="lo-detail"> NMLS# {{ $loan_officer['nmls_number'] }}</p>
                    </div>
                </div>
                <div class="footer disclaimer-text">
                    <img class="profile_img" src="{{ $loan_officer['profile_picture'] }}" alt=""  style="border:2px solid #ffffff;"/>
                    <div style="position: absolute;bottom: {{ $disclosureMargin }};right: -110px;">
                        <h3 class="disclosure-text">
                            {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
                        </h3>
                    </div>
                </div>
                <div class="footer powered-by-text">
                    {{-- <p>POWERED BY</p> --}}
                    <img style="margin-top: -6px; width:50; margin-bottom:10px;"
                        src="{{ config('uplist.flyer_assets_url') . '/poweredby.png' }}" alt="" />
                </div>
                <div style="position: absolute; bottom: -490px; margin-left: 295px" class="footer-house">
                    <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}"
                        style="width: 45px" alt="" />
                </div>
            </div>
        </div>
    </div>
</body>

</html>