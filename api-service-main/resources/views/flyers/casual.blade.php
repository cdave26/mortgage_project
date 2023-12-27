<!DOCTYPE html>
<html lang="en">
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <title>casual.pdf</title>
        <style type="text/css">
            @page {
                margin: 0;
            }

            body {
                font-family: 'Montserrat';
            }

            .header-logo{
                position: absolute;
                right: 50px;
                top: 50px;
                max-width: 220px;
                max-height: 70px;
                width: auto;
                height: auto;
            }
            .header-clouds{
                margin-bottom: -170px;
                margin-left: 70px;
            }
            .div-container{
                padding-top: 80px;
                padding-left: 32px;
            }
            .rates-payment{
                color: #13294B;
                font-size: 30px;
                font-weight: 700;
                margin-top: -12px;
            }
            .info-text{
                color: #13294B;
                font-size: 25px;
                font-weight: 600
            }
            .body-clouds{
                right: 0;
                float: right;
                margin-bottom: -30px;
            }
            .ready-save{
                font-size: 36px;
                margin-top: 25px;
                font-weight: 700;
            }
            .scan-code{
                color: #13294B;
                font-size: 23px;
                margin-top: -10px;
                font-weight:400;
            }
            .qr{
                margin-left: -18px;
                margin-top: 10px;
            }
            .house-img{
                margin-left: 182px;
                margin-top: -200px;
            }
            footer{
                background-color: #13294B;
                color: #fff;
                padding: 50px;
                padding-top: 30px;
                padding-right: 0;
                padding-bottom: 0px !important;
                margin-top: -1px;
                position: absolute;
                bottom: 0;
                left: 0;
                width: 94%;
                border-top: 1px solid gray
            }
            footer img{
                margin-top: 5px;
            }
            .footer-inline{
                display: inline-block;
                vertical-align: top;
            }
            .lo-detail{
                display: inline-block;
                vertical-align: top;
                margin-left: 10px;
                font-size: 12px;
                font-weight: 600;
                width: 300px;
            }
            .lo-detail div{
                margin-bottom:-2px;
            }
            .lo-detail div:first-of-type{
                margin-bottom:-2px;
                font-size: 15px;
                font-weight: 700;
            }
            .second-footer{
                text-align: left;
                position: absolute;
                bottom: 10px;
                z-index: 99;
                padding-bottom: 9px;
            }
            .disclosure{
                display: inline-block;
                vertical-align: bottom;
                text-align: left;
                width: 480px;
                font-size: 10px;
                margin-left: 10px;
                font-weight: 500;
                line-height: 10px;
            }
            .power-by{
                display: inline-block;
                vertical-align: bottom;
                margin-bottom: -8px;
                margin-left: 10px;
            }
            .power-by div{
                font-family: "Times New Roman", Times, serif;
                font-size: 7px;
                text-align: center;
            }
            .power-by img{
                margin-top: -9px;
            }
            .footer-logo{
                display: inline-block;
                vertical-align: bottom;
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <header style="border-bottom: 7px solid {{ $color }};height: 145px;">
            <img
                src="{{ config('uplist.flyer_assets_url') . '/cloud-flyer-txp.jpg' }}"
                width="275"
                class="header-clouds"
            />
            <img
                src="{{ $company['logo'] }}" height="70" class="header-logo"
            />
        </header>
        <div class="div-container">
            <div class="rates-payment">
                Your rates and payments are one click away.
            </div>
            @php

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
            $fontSize = '26px';
            $lineHeight = '31px';
            $addressTop = '-3px';
            $personalInfoTop = '40px';
            $footerHeight = '202px';

            if (Str::length($address) > 46) {
                $fontSize = '20px';
                $lineHeight = '40px';
                $addressTop = '6px';
                $personalInfoTop = '12px';
                $footerHeight = '210px';
            }

            // if (Str::length($address) > 60) {
            //     $fontSize = '24px';
            //     $lineHeight = '20px';
            //     $addressTop = '6px';
            //     $personalInfoTop = '12px';
            //     $footerHeight = '210px';
            // }

            if($company['housing'] == 'equal_housing_lender'){
                $housing = 'house_lender_white.png';
            }else{
                $housing = 'house_opportunity_white.png';
            }
            @endphp
            <div style="font-size: {{ $fontSize }};line-height: {{ $lineHeight }};color: {{ $color }};font-weight: 600;margin-top: {{ $addressTop }};width: 96%;  white-space: nowrap !important;">
                    {{ Str::squish($address) }}
            </div>
            <div style="margin-top: {{ $personalInfoTop }};">
                <span class="info-text">
                    No Personal Information Required.
                </span>
                <img
                    src="{{ config('uplist.flyer_assets_url') . '/cloud-hf-flyer-txp.png' }}"
                    width="150"
                    class="body-clouds"
                />
            </div>
            <div style="color: {{ $color }};" class="ready-save">
                Ready to save?
            </div>
            <div class="scan-code">
                Scan code for live rates
            </div>
            <div>
                <img
                    src="{{ $qr_image }}"
                    width="215"
                    class="qr"
                />
                <img
                    src="{{ config('uplist.flyer_assets_url') . '/house-flyer-txp.png' }}"
                    width="620"
                    height="325"
                    class="house-img"
                />
            </div>
        </div>
        <footer style="height: {{ $footerHeight }}">
            <div class="footer-inline" style="width: 100px;">
                <img
                    src="{{ $loan_officer['profile_picture'] }}"
                    width="100"
                />
            </div>
            <div class="footer-inline">
                <div>
                    <div class="lo-detail">
                        <div>{{ $loan_officer['name'] }}</div>
                        <div>{{ $loan_officer['job_title'] }}</div>
                        <div>{{ $loan_officer['email'] }}</div>
                        <div>{{ $loan_officer['mobile_number'] }}</div>
                        <div>NMLS# {{ $loan_officer['nmls_number'] }}</div>
                    </div>
                </div>
                <div class="second-footer">
                    <div class="disclosure">
                        {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
                    </div>
                    <div class="power-by">
                        <div>POWERED BY&nbsp;</div>
                        <img
                            src="{{ config('uplist.flyer_assets_url') . '/Uplist_wordmark_white.png' }}"
                            width="73"
                        />
                    </div>
                    <div class="footer-logo">
                        <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" width="40"/>
                    </div>
                </div>
            </div>
        </footer>
    </body>
</html>
